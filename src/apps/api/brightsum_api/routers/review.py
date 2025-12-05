from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from ..db import get_session
from .. import auth
from ..models import (
    PracticeInteraction,
    PracticeAttempt,
    QuizAttempt,
    Topic,
    Question,
    QuizAttemptQuestion,
)

router = APIRouter()


@router.get("/summary")
def review_summary(
    session: Session = Depends(get_session),
    user=Depends(auth.current_user),
    topic: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),
) -> Dict[str, Any]:
    """Return a dashboard summary for the current user used by the Review Mistakes page.

    The endpoint gathers basic aggregates from practice interactions, recent attempts,
    and per-topic statistics. It is intentionally DB-light and tolerant of missing data
    (returns sensible defaults when there are no interactions).
    
    Supports optional filters: topic, source, difficulty, date_range.
    """
    # Date range filter
    date_from = None
    if date_range:
        now = datetime.utcnow()
        if date_range == "Last 7 days":
            date_from = now - timedelta(days=7)
        elif date_range == "Last 30 days":
            date_from = now - timedelta(days=30)
        elif date_range == "Last 90 days":
            date_from = now - timedelta(days=90)
        # "All time" => date_from stays None

    # Practice interactions for this user
    attempt_ids = [a.id for a in session.exec(select(PracticeAttempt).where(PracticeAttempt.user_id == user.id)).all()]
    
    # Apply date filter to attempts
    if date_from:
        attempt_ids = [a.id for a in session.exec(select(PracticeAttempt).where(
            PracticeAttempt.user_id == user.id,
            PracticeAttempt.started_at >= date_from
        )).all()]
    
    if attempt_ids:
        interactions = session.exec(select(PracticeInteraction).where(PracticeInteraction.attempt_id.in_(attempt_ids))).all()
    else:
        interactions = []
    
    # Apply difficulty filter to interactions
    if difficulty and difficulty != "All":
        interactions = [i for i in interactions if i.shown_difficulty.lower() == difficulty.lower()]

    total_answered = len([i for i in interactions if i.is_correct is not None])
    total_correct = len([i for i in interactions if i.is_correct])
    total_incorrect = len([i for i in interactions if i.is_correct is False])

    overall_accuracy = round((total_correct / total_answered) * 100, 0) if total_answered > 0 else None

    # Questions answered and week's accuracy: consider interactions in last 7 days
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    week_interactions = [i for i in interactions if (i.time_seconds is not None) or True]  # placeholder - cannot compare timestamp on interaction
    # Fallback: use same as overall for now
    week_accuracy = overall_accuracy

    # Avg hints per question
    hints_per_q = round((sum(i.hints_requested for i in interactions) / total_answered), 2) if total_answered > 0 else 0.0

    # Avg difficulty reached: infer from most common shown_difficulty
    from collections import Counter

    diffs = [i.shown_difficulty for i in interactions if getattr(i, 'shown_difficulty', None)]
    if diffs:
        most_common = Counter(diffs).most_common(1)[0][0]
    else:
        most_common = 'medium'

    # Topic-level stats
    topics = session.exec(select(Topic)).all()
    
    # Apply topic filter
    if topic and topic != "All topics":
        topics = [t for t in topics if t.name.lower() == topic.lower() or t.slug.lower() == topic.lower()]
    
    topics_out: List[Dict[str, Any]] = []
    for t in topics:
        # get question ids for topic
        qids = [q.id for q in session.exec(select(Question).where(Question.topic_id == t.id)).all()]
        if not qids:
            topics_out.append({"name": t.name, "accuracy": None, "mistakes": 0})
            continue
        topic_interactions = [i for i in interactions if i.question_id in qids and i.is_correct is not None]
        if topic_interactions:
            correct = len([i for i in topic_interactions if i.is_correct])
            total = len(topic_interactions)
            accuracy = int(round((correct / total) * 100))
            mistakes = len([i for i in topic_interactions if i.is_correct is False])
        else:
            accuracy = None
            mistakes = 0
        topics_out.append({"name": t.name, "accuracy": accuracy if accuracy is not None else 0, "mistakes": mistakes})

    # Recent sessions: quizzes and practice attempts
    recent_quizzes = []
    q_query = select(QuizAttempt).where(QuizAttempt.user_id == user.id)
    if date_from:
        q_query = q_query.where(QuizAttempt.started_at >= date_from)
    q_attempts = session.exec(q_query.order_by(QuizAttempt.started_at.desc())).all()[:5]
    
    for qa in q_attempts:
        topic_obj = session.exec(select(Topic).where(Topic.id == qa.topic_id)).first()
        # Apply topic filter
        if topic and topic != "All topics":
            if not topic_obj or (topic_obj.name.lower() != topic.lower() and topic_obj.slug.lower() != topic.lower()):
                continue
        # Apply source filter
        if source and source != "All" and source.lower() != "quizzes":
            continue
        recent_quizzes.append({
            "id": qa.id,
            "name": f"Quiz: {topic_obj.name if topic_obj else qa.topic_id}",
            "date": qa.started_at.isoformat() if qa.started_at else None,
            "score": f"{int(qa.score_percent) if qa.score_percent is not None else 0}%",
        })

    recent_practice = []
    p_query = select(PracticeAttempt).where(PracticeAttempt.user_id == user.id)
    if date_from:
        p_query = p_query.where(PracticeAttempt.started_at >= date_from)
    p_attempts = session.exec(p_query.order_by(PracticeAttempt.started_at.desc())).all()[:5]
    
    for pa in p_attempts:
        topic_obj = session.exec(select(Topic).where(Topic.id == pa.topic_id)).first()
        # Apply topic filter
        if topic and topic != "All topics":
            if not topic_obj or (topic_obj.name.lower() != topic.lower() and topic_obj.slug.lower() != topic.lower()):
                continue
        # Apply source filter
        if source and source != "All" and source.lower() != "practice":
            continue
        pis = session.exec(select(PracticeInteraction).where(PracticeInteraction.attempt_id == pa.id)).all()
        problems = len(pis)
        correct = len([p for p in pis if p.is_correct])
        correct_pct = int(round((correct / problems) * 100)) if problems > 0 else 0
        recent_practice.append({
            "id": pa.id,
            "name": f"Practice: {topic_obj.name if topic_obj else pa.topic_id}",
            "problems": problems,
            "correct": f"{correct_pct}% correct",
        })

    # Goal progress: count interactions today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_attempts = session.exec(select(PracticeAttempt).where(
        PracticeAttempt.user_id == user.id,
        PracticeAttempt.started_at >= today_start
    )).all()
    today_attempt_ids = [a.id for a in today_attempts]
    if today_attempt_ids:
        today_interactions = session.exec(select(PracticeInteraction).where(PracticeInteraction.attempt_id.in_(today_attempt_ids))).all()
        problems_today = len(today_interactions)
    else:
        problems_today = 0
    
    # Assume daily goal is 10 problems
    daily_goal = 10
    goal_progress = min(1.0, problems_today / daily_goal) if daily_goal > 0 else 0.0

    return {
        "overall": {
            "accuracy": overall_accuracy or 0,
            "total_mistakes": total_incorrect,
            "questions_answered": total_answered,
            "week_accuracy": week_accuracy or 0,
            "avg_difficulty": most_common,
            "avg_hints_per_question": hints_per_q,
            "goal_progress": goal_progress,
            "problems_today": problems_today,
            "daily_goal": daily_goal,
        },
        "topics": topics_out,
        "recent_sessions": {"quizzes": recent_quizzes, "practice": recent_practice},
    }


@router.get("/practice_attempts/{attempt_id}/mistakes")
def practice_attempt_mistakes(attempt_id: int, session: Session = Depends(get_session), user=Depends(auth.current_user)):
    # verify attempt belongs to user
    pa = session.exec(select(PracticeAttempt).where(PracticeAttempt.id == attempt_id, PracticeAttempt.user_id == user.id)).first()
    if not pa:
        return {"mistakes": []}
    # fetch interactions in order for the attempt
    pis = session.exec(
        select(PracticeInteraction).where(PracticeInteraction.attempt_id == attempt_id).order_by(PracticeInteraction.id)
    ).all()

    mistakes = []
    for p in pis:
        # Consider an interaction a 'mistake' if it was recorded incorrect, or
        # if it's ungraded (is_correct is None) but the student submitted an answer
        # (i.e., they attempted and did not get automatic credit). This ensures
        # we show all student mistakes made during the session.
        attempted_answer = (p.answer_submitted is not None and str(p.answer_submitted).strip() != "")
        is_mistake = (p.is_correct is False) or (p.is_correct is None and attempted_answer)
        if is_mistake:
            q = session.exec(select(Question).where(Question.id == p.question_id)).first()
            mistakes.append({
                "question_id": p.question_id,
                "question_stem": q.stem if q else None,
                "correct_answer": q.answer if q else None,
                "is_correct": p.is_correct,
                "submitted": p.answer_submitted,
                "hints": p.hints_requested,
                "time_seconds": p.time_seconds,
            })
    return {"mistakes": mistakes}


@router.get("/quiz_attempts/{attempt_id}/mistakes")
def quiz_attempt_mistakes(attempt_id: int, session: Session = Depends(get_session), user=Depends(auth.current_user)):
    # Return quiz-level summary. The current data model does not store per-question
    # interactions for quizzes, so return the quiz metadata and an empty mistakes list.
    qa = session.exec(select(QuizAttempt).where(QuizAttempt.id == attempt_id, QuizAttempt.user_id == user.id)).first()
    if not qa:
        return {"mistakes": [], "quiz": None}
    topic = session.exec(select(Topic).where(Topic.id == qa.topic_id)).first()
    # Retrieve per-question rows if any were persisted at submit time
    qa_rows = session.exec(select(QuizAttemptQuestion).where(QuizAttemptQuestion.attempt_id == attempt_id)).all()
    mistakes = []
    for r in qa_rows:
        # join to question for more context
        q = session.exec(select(Question).where(Question.id == r.question_id)).first()
        mistakes.append({
            "question_id": r.question_id,
            "question_stem": q.stem if q else None,
            "correct_answer": q.answer if q else None,
            "given_answer": r.given_answer,
            "is_correct": r.is_correct,
            "position": r.position,
            "info_score": r.info_score,
            "time_seconds": r.time_seconds,
            "hints": r.hints_requested,
        })

    return {
        "quiz": {
            "id": qa.id,
            "topic_id": qa.topic_id,
            "topic_name": topic.name if topic else None,
            "started_at": qa.started_at.isoformat() if qa.started_at else None,
            "score_percent": qa.score_percent,
            "passed": bool(qa.passed),
        },
        "mistakes": [m for m in mistakes if m.get('is_correct') is False],
        "note": "Quiz attempt metadata returned; per-question results included when available.",
    }
