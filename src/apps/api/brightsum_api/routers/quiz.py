"""Quiz API endpoints with time validation and pass/fail logic.

Endpoints:
- GET /api/quiz/{topic_slug} - Get quiz questions for a topic
- POST /api/quiz/{topic_slug}/start - Start a new quiz attempt
- POST /api/quiz/{attempt_id}/submit - Submit quiz answers and get results
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from brightsum_api.auth import current_user
from brightsum_api.db import get_session
from brightsum_api.models import (
    User,
    Topic,
    Question,
    QuestionHint,
    QuizAttempt,
    QuizAttemptQuestion,
    MasteryState,
)
import random
from brightsum_api.ml.mastery import update_mastery
from brightsum_api.ml.irt_selection import select_quiz_questions_irt

router = APIRouter()

# Request/Response Models
class QuizQuestionResponse(BaseModel):
    """A single quiz question (no hints, no correct answer exposed)."""

    id: int
    stem: str
    base_difficulty: str


class QuizInfoResponse(BaseModel):
    """Initial quiz information when starting a quiz."""

    topic_id: int
    topic_name: str
    topic_slug: str
    questions: List[QuizQuestionResponse]
    time_limit_minutes: int = 25  # Default 25 minutes
    total_questions: int


class QuizStartResponse(BaseModel):
    """Response when starting a quiz attempt."""

    attempt_id: int
    started_at: datetime
    time_limit_minutes: int
    expires_at: datetime
    questions: List[QuizQuestionResponse]


class QuizAnswerSubmission(BaseModel):
    """Single answer submission."""

    question_id: int
    answer_submitted: str


class QuizSubmitRequest(BaseModel):
    """Complete quiz submission with all answers."""

    answers: List[QuizAnswerSubmission]


class QuizResultDetail(BaseModel):
    """Result for a single question."""

    question_id: int
    stem: str
    your_answer: str
    correct_answer: str
    is_correct: bool
    base_difficulty: str


class QuizSubmitResponse(BaseModel):
    """Final quiz results with pass/fail."""

    attempt_id: int
    score: int
    total_questions: int
    score_percent: float
    passed: bool
    time_taken_seconds: float
    results: List[QuizResultDetail]
    mastery_updated: Optional[float] = None


# Endpoints

@router.get("/{topic_slug}", response_model=QuizInfoResponse)
def get_quiz_info(
    topic_slug: str = Path(..., description="Topic slug (e.g., 'expressions')"),
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Get quiz information for a topic (questions list, time limit, etc.)."""

    # Find topic
    topic = session.exec(select(Topic).where(Topic.slug == topic_slug)).first()
    if not topic:
        raise HTTPException(status_code=404, detail=f"Topic '{topic_slug}' not found")

    # Get all questions for the topic (ignore is_quiz_only flag per request)
    questions = session.exec(
        select(Question).where(Question.topic_id == topic.id)
    ).all()

    if not questions:
        raise HTTPException(
            status_code=404, detail=f"No quiz questions found for topic '{topic_slug}'"
        )

    # Convert to response format (no answers exposed)
    quiz_questions = [
        QuizQuestionResponse(
            id=q.id, stem=q.stem, base_difficulty=q.base_difficulty
        )
        for q in questions
    ]

    # Return quiz info. For UI we expose a default quiz size as the
    # expected number of questions that will be presented when starting a quiz.
    DEFAULT_QUIZ_SIZE = 10

    return QuizInfoResponse(
        topic_id=topic.id,
        topic_name=topic.name,
        topic_slug=topic.slug,
        questions=quiz_questions,
        time_limit_minutes=25,
        total_questions=DEFAULT_QUIZ_SIZE,
    )


@router.post("/{topic_slug}/start", response_model=QuizStartResponse)
def start_quiz(
    topic_slug: str = Path(..., description="Topic slug (e.g., 'expressions')"),
    num_questions: int = 10,
    strategy: str = "default",
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Start a new quiz attempt for the given topic."""

    # Find topic
    topic = session.exec(select(Topic).where(Topic.slug == topic_slug)).first()
    if not topic:
        raise HTTPException(status_code=404, detail=f"Topic '{topic_slug}' not found")

    # Get all questions for the topic and ignore quiz-only flags (pick from whole dataset)
    questions = session.exec(select(Question).where(Question.topic_id == topic.id)).all()

    if not questions:
        raise HTTPException(
            status_code=404, detail=f"No quiz questions found for topic '{topic_slug}'"
        )

    # If IRT strategy requested, attempt to select top-k informative questions
    if strategy == "irt_information":
        try:
            irt_selected = select_quiz_questions_irt(session, user.id, topic.id, k=num_questions)
            if irt_selected:
                # select_quiz_questions_irt now returns List[Tuple[Question, info_score]]
                questions = [q for q, _info in irt_selected]
                # store the info scores alongside questions for persistence later
                irt_info_map = {q.id: info for q, info in irt_selected}
        except Exception:
            # If anything fails, fallback to the default question set
            irt_info_map = {}

    # Ensure the quiz size is limited to num_questions. For IRT we've already
    # selected up to k items; for the default strategy, randomly sample when
    # the available questions exceed the requested size.
    try:
        num_questions = int(num_questions)
    except Exception:
        num_questions = 10

    if len(questions) > num_questions:
        if strategy == "irt_information" and 'irt_info_map' in locals():
            # IRT selection is ordered by info; truncate to requested size
            questions = questions[:num_questions]
        else:
            # Default behavior: random sample a subset to keep quizzes compact
            questions = random.sample(questions, num_questions)

    # Create quiz attempt
    started_at = datetime.utcnow()
    time_limit_minutes = 25
    expires_at = started_at + timedelta(minutes=time_limit_minutes)

    attempt = QuizAttempt(
        user_id=user.id,
        topic_id=topic.id,
        started_at=started_at,
        finished_at=None,
        score_percent=None,
        passed=None,
    )

    session.add(attempt)
    session.commit()
    session.refresh(attempt)

    # Persist selected questions for this attempt so submissions can be validated
    for idx, q in enumerate(questions):
        qa = QuizAttemptQuestion(
            attempt_id=attempt.id,
            question_id=q.id,
            position=idx,
            info_score=irt_info_map.get(q.id) if 'irt_info_map' in locals() else None,
        )
        session.add(qa)
    session.commit()

    # Return quiz info
    quiz_questions = [
        QuizQuestionResponse(
            id=q.id, stem=q.stem, base_difficulty=q.base_difficulty
        )
        for q in questions
    ]

    return QuizStartResponse(
        attempt_id=attempt.id,
        started_at=started_at,
        time_limit_minutes=time_limit_minutes,
        expires_at=expires_at,
        questions=quiz_questions,
    )


@router.post("/{attempt_id}/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    attempt_id: int = Path(..., description="Quiz attempt ID"),
    body: QuizSubmitRequest = ...,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Submit quiz answers and get graded results with pass/fail."""

    # Find the quiz attempt
    attempt = session.exec(
        select(QuizAttempt).where(QuizAttempt.id == attempt_id)
    ).first()

    if not attempt:
        raise HTTPException(status_code=404, detail="Quiz attempt not found")

    # Verify ownership
    if attempt.user_id != user.id:
        raise HTTPException(
            status_code=403, detail="You can only submit your own quiz"
        )

    # Check if already submitted
    if attempt.finished_at is not None:
        raise HTTPException(status_code=400, detail="Quiz already submitted")

    # Validate time limit (25 minutes)
    now = datetime.utcnow()
    time_elapsed = (now - attempt.started_at).total_seconds()
    time_limit_seconds = 25 * 60

    if time_elapsed > time_limit_seconds:
        raise HTTPException(
            status_code=400,
            detail=f"Time limit exceeded. Quiz must be completed within 25 minutes.",
        )

    # Grade the answers — only for questions that were part of this attempt
    results = []
    correct_count = 0

    # Load allowed question ids for this attempt
    allowed_q_rows = session.exec(
        select(QuizAttemptQuestion).where(QuizAttemptQuestion.attempt_id == attempt.id)
    ).all()
    allowed_qids = {r.question_id for r in allowed_q_rows}

    # Build a map of question_id -> Question for quick lookup
    questions_map = {}
    if allowed_qids:
        q_objs = session.exec(select(Question).where(Question.id.in_(list(allowed_qids)))).all()
        questions_map = {q.id: q for q in q_objs}

    for answer_submission in body.answers:
        qid = answer_submission.question_id
        # Only grade if the question was part of this attempt
        if qid not in allowed_qids:
            # ignore submissions for questions not in this attempt
            continue

        question = questions_map.get(qid)
        if not question:
            continue

        # Normalize answers for comparison
        user_answer = answer_submission.answer_submitted.strip().lower()
        correct_answer = question.answer.strip().lower()

        is_correct = user_answer == correct_answer

        if is_correct:
            correct_count += 1

        # Persist per-question response into QuizAttemptQuestion if present
        try:
            qa_row = session.exec(
                select(QuizAttemptQuestion)
                .where(QuizAttemptQuestion.attempt_id == attempt.id)
                .where(QuizAttemptQuestion.question_id == qid)
            ).first()
            if qa_row:
                qa_row.is_correct = is_correct
                qa_row.given_answer = answer_submission.answer_submitted
                # time_seconds and hints_requested are not tracked in quiz flow currently
                session.add(qa_row)
        except Exception:
            # non-fatal: if persistence fails, continue
            pass

        results.append(
            QuizResultDetail(
                question_id=question.id,
                stem=question.stem,
                your_answer=answer_submission.answer_submitted,
                correct_answer=question.answer,
                is_correct=is_correct,
                base_difficulty=question.base_difficulty,
            )
        )

    # Calculate score
    # Use the number of questions that were actually part of the attempt
    total_questions = len(allowed_qids) if allowed_qids else len(body.answers)
    score_percent = (correct_count / total_questions * 100) if total_questions > 0 else 0
    passed = score_percent >= 70  # Pass threshold: 70%

    # Update attempt
    attempt.finished_at = now
    attempt.score_percent = score_percent
    attempt.passed = passed
    session.add(attempt)

    # Update mastery state
    mastery_state = session.exec(
        select(MasteryState)
        .where(MasteryState.user_id == user.id)
        .where(MasteryState.topic_id == attempt.topic_id)
    ).first()

    new_mastery = None
    if mastery_state:
        # Update existing mastery based on pass/fail
        new_mastery = update_mastery(mastery_state.mastery, passed)
        mastery_state.mastery = new_mastery
        mastery_state.last_updated = now
        session.add(mastery_state)
    else:
        # Create new mastery state
        new_mastery = 0.7 if passed else 0.3
        mastery_state = MasteryState(
            user_id=user.id,
            topic_id=attempt.topic_id,
            mastery=new_mastery,
            last_updated=now,
        )
        session.add(mastery_state)

    session.commit()

    return QuizSubmitResponse(
        attempt_id=attempt.id,
        score=correct_count,
        total_questions=total_questions,
        score_percent=round(score_percent, 2),
        passed=passed,
        time_taken_seconds=round(time_elapsed, 2),
        results=results,
        mastery_updated=round(new_mastery, 3) if new_mastery else None,
    )