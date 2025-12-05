from typing import List, Optional, Dict
import os
import re
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..db import get_session
from .. import auth
from ..models import Topic, Question, QuestionHint, LessonSlide, PracticeInteraction, PracticeAttempt, QuizAttempt, MasteryState
from fastapi import UploadFile, File
from fastapi.responses import StreamingResponse
import csv
from io import StringIO

router = APIRouter()


class TopicOut(BaseModel):
    id: int
    slug: str
    name: str
    description: Optional[str] = None
    estimated_time_min: Optional[int] = None
    objectives: Optional[str] = None


class TopicIn(BaseModel):
    slug: str
    name: Optional[str] = None
    description: Optional[str] = None
    estimated_time_min: Optional[int] = None
    objectives: Optional[str] = None


class QuestionIn(BaseModel):
    topic_slug: str
    stem: str
    answer: str
    base_difficulty: str = "medium"
    is_quiz_only: Optional[bool] = False
    hints: Optional[List[str]] = None


class QuestionOut(BaseModel):
    id: int
    topic_id: int
    stem: str
    answer: str
    base_difficulty: str
    is_quiz_only: bool
    hints: Optional[List[str]] = None


def require_teacher(user = Depends(auth.current_user)):
    if user.role not in ("teacher", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher role required")
    return user


@router.get("/topics", response_model=List[TopicOut])
def list_topics(session: Session = Depends(get_session), _=Depends(require_teacher)):
    topics = session.exec(select(Topic)).all()
    return [TopicOut(id=t.id, slug=t.slug, name=t.name, description=t.description) for t in topics]


@router.post("/topics", response_model=TopicOut)
def create_topic(body: TopicIn, session: Session = Depends(get_session), _=Depends(require_teacher)):
    existing = session.exec(select(Topic).where(Topic.slug == body.slug)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Topic slug already exists")
    topic = Topic(slug=body.slug, name=body.name or body.slug, description=body.description, estimated_time_min=body.estimated_time_min, objectives=body.objectives)
    session.add(topic)
    session.commit()
    session.refresh(topic)
    return TopicOut(id=topic.id, slug=topic.slug, name=topic.name, description=topic.description, estimated_time_min=topic.estimated_time_min, objectives=topic.objectives)


@router.put("/topics/{topic_id}", response_model=TopicOut)
def update_topic(topic_id: int, body: TopicIn, session: Session = Depends(get_session), _=Depends(require_teacher)):
    """Allow teachers to edit a topic's slug/name/description.

    If the slug is changed, ensure it doesn't collide with another topic.
    """
    topic = session.exec(select(Topic).where(Topic.id == topic_id)).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    # if slug is changing, ensure uniqueness
    if body.slug and body.slug != topic.slug:
        other = session.exec(select(Topic).where(Topic.slug == body.slug, Topic.id != topic_id)).first()
        if other:
            raise HTTPException(status_code=400, detail="Topic slug already in use")
    topic.slug = body.slug
    topic.name = body.name or body.slug
    topic.description = body.description
    topic.estimated_time_min = body.estimated_time_min
    topic.objectives = body.objectives
    session.add(topic)
    session.commit()
    session.refresh(topic)
    return TopicOut(id=topic.id, slug=topic.slug, name=topic.name, description=topic.description, estimated_time_min=topic.estimated_time_min, objectives=topic.objectives)


@router.delete("/topics/{topic_id}")
def delete_topic(topic_id: int, session: Session = Depends(get_session), _=Depends(require_teacher)):
    """Delete a topic and related data. This will remove:
      - lesson slides for the topic
      - question hints for questions in the topic
      - practice interactions that reference those questions
      - questions in the topic
      - practice attempts, quiz attempts and mastery states for the topic

    Returns counts of deleted rows for client confirmation.
    """
    # ensure topic exists
    topic = session.exec(select(Topic).where(Topic.id == topic_id)).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # gather question ids for the topic
    questions = session.exec(select(Question).where(Question.topic_id == topic_id)).all()
    qids = [q.id for q in questions]

    deleted = {
        'lesson_slides': 0,
        'question_hints': 0,
        'practice_interactions': 0,
        'questions': 0,
        'practice_attempts': 0,
        'quiz_attempts': 0,
        'mastery_states': 0,
        'topic': 0,
    }

    # delete lesson slides
    slides = session.exec(select(LessonSlide).where(LessonSlide.topic_id == topic_id)).all()
    for s in slides:
        session.delete(s)
        deleted['lesson_slides'] += 1
    session.commit()

    # delete question hints for questions in topic
    if qids:
        hints = session.exec(select(QuestionHint).where(QuestionHint.question_id.in_(qids))).all()
        for h in hints:
            session.delete(h)
            deleted['question_hints'] += 1
        session.commit()

        # delete practice interactions referencing those questions
        interactions = session.exec(select(PracticeInteraction).where(PracticeInteraction.question_id.in_(qids))).all()
        for pi in interactions:
            session.delete(pi)
            deleted['practice_interactions'] += 1
        session.commit()

        # delete the questions themselves
        for q in questions:
            session.delete(q)
            deleted['questions'] += 1
        session.commit()

    # delete practice attempts, quiz attempts and mastery states tied to this topic
    pats = session.exec(select(PracticeAttempt).where(PracticeAttempt.topic_id == topic_id)).all()
    for p in pats:
        session.delete(p)
        deleted['practice_attempts'] += 1
    session.commit()

    qats = session.exec(select(QuizAttempt).where(QuizAttempt.topic_id == topic_id)).all()
    for q in qats:
        session.delete(q)
        deleted['quiz_attempts'] += 1
    session.commit()

    ms = session.exec(select(MasteryState).where(MasteryState.topic_id == topic_id)).all()
    for m in ms:
        session.delete(m)
        deleted['mastery_states'] += 1
    session.commit()

    # finally delete the topic
    session.delete(topic)
    session.commit()
    deleted['topic'] = 1

    return deleted


@router.get("/questions", response_model=List[QuestionOut])
def list_questions(topic: Optional[str] = None, session: Session = Depends(get_session), _=Depends(require_teacher)):
    q = select(Question)
    if topic:
        # join via topic slug lookup
        t = session.exec(select(Topic).where(Topic.slug == topic)).first()
        if not t:
            return []
        q = select(Question).where(Question.topic_id == t.id)
    results = session.exec(q).all()
    out = []
    for r in results:
        hints = session.exec(select(QuestionHint).where(QuestionHint.question_id == r.id).order_by(QuestionHint.ordering)).all()
        hint_texts = [hh.hint_text for hh in hints] if hints else []
        out.append(QuestionOut(id=r.id, topic_id=r.topic_id, stem=r.stem, answer=r.answer, base_difficulty=r.base_difficulty, is_quiz_only=r.is_quiz_only, hints=hint_texts))
    return out


@router.post("/questions", response_model=QuestionOut)
def create_question(body: QuestionIn, session: Session = Depends(get_session), user=Depends(require_teacher)):
    # Ensure topic exists or create
    topic = session.exec(select(Topic).where(Topic.slug == body.topic_slug)).first()
    if not topic:
        topic = Topic(slug=body.topic_slug, name=body.topic_slug)
        session.add(topic)
        session.commit()
        session.refresh(topic)
    # Basic validation
    if not body.stem.strip() or not body.answer.strip():
        raise HTTPException(status_code=400, detail="Stem and answer are required")
    # Duplicate detection: avoid inserting exact duplicates
    existing_q = session.exec(
        select(Question).where(
            Question.topic_id == topic.id,
            Question.stem == body.stem,
            Question.answer == body.answer,
        )
    ).first()
    if existing_q:
        raise HTTPException(status_code=409, detail=f"Duplicate question exists (id={existing_q.id})")
    question = Question(topic_id=topic.id, stem=body.stem, answer=body.answer, base_difficulty=body.base_difficulty, is_quiz_only=bool(body.is_quiz_only))
    session.add(question)
    session.commit()
    session.refresh(question)
    # save hints if provided
    if getattr(body, 'hints', None):
        for idx, ht in enumerate(body.hints or [], start=1):
            hint = QuestionHint(question_id=question.id, level=min(3, max(1, idx)), hint_text=ht, ordering=idx)
            session.add(hint)
        session.commit()
    hints = session.exec(select(QuestionHint).where(QuestionHint.question_id == question.id).order_by(QuestionHint.ordering)).all()
    hint_texts = [h.hint_text for h in hints] if hints else []
    return QuestionOut(id=question.id, topic_id=question.topic_id, stem=question.stem, answer=question.answer, base_difficulty=question.base_difficulty, is_quiz_only=question.is_quiz_only, hints=hint_texts)


def _slugify(s: str) -> str:
    s = (s or '').strip().lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s


FIELD_SYNONYMS: Dict[str, List[str]] = {
    'topic_slug': ['topic key', 'topic_key', 'topic-slug', 'topic_slug', 'topic slug', 'topic', 'topic_name', 'topic name', 'topic title'],
    'stem': ['prompt', 'stem', 'question', 'question_text', 'prompt_text'],
    'answer': ['answer', 'correct_answer'],
    'base_difficulty': ['difficulty', 'base_difficulty', 'level'],
    'is_quiz_only': ['quiz only', 'is_quiz_only', 'quiz_only', 'quizonly', 'is_quiz'],
    'hints': ['hints', 'hint', 'hint_text', 'hints_list', 'hints[]']
}


@router.get("/questions/template.csv")
def download_template(_=Depends(require_teacher)):
    """Return a CSV template for question import using teacher-friendly headers."""
    csv_content = (
        "Topic,Prompt,Answer,Difficulty,Quiz Only,Hints\n"
        "algebra-linear-equations,\"Solve for x: 2x + 3 = 11\",4,medium,false,\"Isolate x||Divide both sides by 2\"\n"
        "expressions,\"Simplify 2(x + 3)\",\"2x + 6\",medium,false,\"Distribute 2||Combine like terms\"\n"
    )
    return StreamingResponse(StringIO(csv_content), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=question_import_template.csv"})


@router.post("/questions/import")
def import_questions(file: UploadFile = File(...), session: Session = Depends(get_session), _=Depends(require_teacher)):
    """Import questions from an uploaded CSV file.

    Accepted header synonyms (case-insensitive):
      Topic / Topic Key / topic_slug -> topic group
      Prompt / stem / question -> question text
      Answer -> correct answer
      Difficulty / base_difficulty -> easy|medium|hard
      Quiz Only / is_quiz_only -> boolean (true/false, 1/0)

    Returns a per-row summary of created/failed rows.
    """
    if file.content_type not in ("text/csv", "application/vnd.ms-excel", "text/plain"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    text = file.file.read().decode('utf-8')
    reader = csv.DictReader(StringIO(text))
    fieldnames = [c.strip() for c in (reader.fieldnames or [])]
    lower_to_actual = {c.lower(): c for c in fieldnames}

    # build mapping from canonical field -> actual CSV header
    mapping: Dict[str, Optional[str]] = {}
    for canonical, syns in FIELD_SYNONYMS.items():
        found = None
        for s in syns:
            if s in lower_to_actual:
                found = lower_to_actual[s]
                break
        mapping[canonical] = found

    # Require at least one topic identifier plus stem and answer
    missing = []
    if not mapping.get('topic_slug'):
        missing.append('Topic or Topic Key')
    if not mapping.get('stem'):
        missing.append('Prompt')
    if not mapping.get('answer'):
        missing.append('Answer')
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(missing)}")

    rows = []
    created = 0
    failed = 0
    duplicate = 0
    for i, row in enumerate(reader, start=1):
        try:
            # read values using mapped headers (fall back to empty)
            raw_topic = (row.get(mapping.get('topic_slug')) or '').strip() if mapping.get('topic_slug') else ''
            stem = (row.get(mapping.get('stem')) or '').strip() if mapping.get('stem') else ''
            answer = (row.get(mapping.get('answer')) or '').strip() if mapping.get('answer') else ''
            hints_raw = (row.get(mapping.get('hints')) or '').strip() if mapping.get('hints') else ''
            base_difficulty = (row.get(mapping.get('base_difficulty')) or 'medium').strip().lower() if mapping.get('base_difficulty') else 'medium'
            is_quiz_only_raw = (row.get(mapping.get('is_quiz_only')) or '0').strip() if mapping.get('is_quiz_only') else '0'

            if not raw_topic or not stem or not answer:
                raise ValueError('Topic, Prompt and Answer are required')

            # Normalize difficulty
            if base_difficulty not in ('easy', 'medium', 'hard'):
                raise ValueError('Difficulty must be one of easy, medium, hard')

            is_quiz_only = str(is_quiz_only_raw).lower() in ('1', 'true', 'yes')

            # Determine topic slug: if the provided topic looks like a machine key use as-is, otherwise slugify
            topic_slug = raw_topic
            if ' ' in topic_slug or topic_slug != topic_slug.lower() or not re.match(r'^[a-z0-9\-]+$', topic_slug):
                topic_slug = _slugify(topic_slug)
            if not topic_slug:
                raise ValueError('Invalid topic value')

            # ensure topic exists
            topic = session.exec(select(Topic).where(Topic.slug == topic_slug)).first()
            if not topic:
                topic = Topic(slug=topic_slug, name=raw_topic)
                session.add(topic)
                session.commit()
                session.refresh(topic)
            # duplicate detection: same topic, stem, answer
            existing_q = session.exec(
                select(Question).where(
                    Question.topic_id == topic.id,
                    Question.stem == stem,
                    Question.answer == answer,
                )
            ).first()
            if existing_q:
                rows.append({"row": i, "status": "duplicate", "id": existing_q.id})
                duplicate += 1
            else:
                q = Question(topic_id=topic.id, stem=stem, answer=answer, base_difficulty=base_difficulty, is_quiz_only=is_quiz_only)
                session.add(q)
                session.commit()
                session.refresh(q)
                # parse hints and insert if present. Accept JSON array or '||' separated text.
                parsed_hints: List[str] = []
                if hints_raw:
                    h = hints_raw
                    # JSON array
                    if h.startswith('['):
                        try:
                            import json
                            arr = json.loads(h)
                            if isinstance(arr, list):
                                parsed_hints = [str(x).strip() for x in arr if str(x).strip()]
                        except Exception:
                            parsed_hints = []
                    else:
                        # split by double-pipe, single pipe, or semicolon
                        parts = [p.strip() for p in re.split(r"\|\||\||;", h) if p.strip()]
                        parsed_hints = parts
                for idx, hint_text in enumerate(parsed_hints, start=1):
                    hint = QuestionHint(question_id=q.id, level=min(3, max(1, idx)), hint_text=hint_text, ordering=idx)
                    session.add(hint)
                if parsed_hints:
                    session.commit()
                rows.append({"row": i, "status": "created", "id": q.id})
                created += 1
        except Exception as e:
            rows.append({"row": i, "status": "failed", "error": str(e)})
            failed += 1

    return {"created": created, "duplicate": duplicate, "failed": failed, "rows": rows}


@router.get("/questions/{question_id}", response_model=QuestionOut)
def get_question(question_id: int, session: Session = Depends(get_session), _=Depends(require_teacher)):
    q = session.exec(select(Question).where(Question.id == question_id)).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    hints = session.exec(select(QuestionHint).where(QuestionHint.question_id == q.id).order_by(QuestionHint.ordering)).all()
    hint_texts = [h.hint_text for h in hints] if hints else []
    return QuestionOut(id=q.id, topic_id=q.topic_id, stem=q.stem, answer=q.answer, base_difficulty=q.base_difficulty, is_quiz_only=q.is_quiz_only, hints=hint_texts)


@router.put("/questions/{question_id}", response_model=QuestionOut)
def update_question(question_id: int, body: QuestionIn, session: Session = Depends(get_session), _=Depends(require_teacher)):
    q = session.exec(select(Question).where(Question.id == question_id)).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    # ensure topic exists
    topic = session.exec(select(Topic).where(Topic.slug == body.topic_slug)).first()
    if not topic:
        topic = Topic(slug=body.topic_slug, name=body.topic_slug)
        session.add(topic)
        session.commit()
        session.refresh(topic)
    # Duplicate detection: make sure another question with same topic/stem/answer doesn't exist
    other = session.exec(
        select(Question).where(
            Question.topic_id == topic.id,
            Question.stem == body.stem,
            Question.answer == body.answer,
            Question.id != question_id,
        )
    ).first()
    if other:
        raise HTTPException(status_code=409, detail=f"Another question with same content exists (id={other.id})")

    q.topic_id = topic.id
    q.stem = body.stem
    q.answer = body.answer
    q.base_difficulty = body.base_difficulty
    q.is_quiz_only = bool(body.is_quiz_only)
    session.add(q)
    session.commit()
    session.refresh(q)
    # update hints: remove existing and replace with provided hints (if any)
    if getattr(body, 'hints', None) is not None:
        # delete existing hints
        existing_hints = session.exec(select(QuestionHint).where(QuestionHint.question_id == q.id)).all()
        for eh in existing_hints:
            session.delete(eh)
        session.commit()
        # insert new hints
        for idx, ht in enumerate(body.hints or [], start=1):
            hint = QuestionHint(question_id=q.id, level=min(3, max(1, idx)), hint_text=ht, ordering=idx)
            session.add(hint)
        session.commit()
    hints = session.exec(select(QuestionHint).where(QuestionHint.question_id == q.id).order_by(QuestionHint.ordering)).all()
    hint_texts = [h.hint_text for h in hints] if hints else []
    return QuestionOut(id=q.id, topic_id=q.topic_id, stem=q.stem, answer=q.answer, base_difficulty=q.base_difficulty, is_quiz_only=q.is_quiz_only, hints=hint_texts)


@router.delete("/questions/{question_id}")
def delete_question(question_id: int, session: Session = Depends(get_session), _=Depends(require_teacher)):
    q = session.exec(select(Question).where(Question.id == question_id)).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    session.delete(q)
    session.commit()
    return {"message": "deleted"}
