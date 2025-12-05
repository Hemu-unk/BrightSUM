"""Practice API endpoints with ML-powered hints and adaptive difficulty.

Endpoints:
- GET /api/practice/{topic_slug} - Get practice session info
- POST /api/practice/{topic_slug}/attempt - Start a practice attempt
- POST /api/practice/{attempt_id}/submit - Submit a question answer
- POST /api/practice/{attempt_id}/hint - Get next hint for current question
"""

from __future__ import annotations

from datetime import datetime
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
    PracticeAttempt,
    PracticeInteraction,
    MasteryState,
)
from brightsum_api.ml.difficulty import choose_difficulty
from brightsum_api.ml.hint_inference import predict_hint_level
from brightsum_api.ml.mastery import update_mastery
import random

router = APIRouter()

# Request/Response Models
class PracticeInfoResponse(BaseModel):
    """Initial practice session information."""

    topic_id: int
    topic_name: str
    topic_slug: str
    total_questions: int
    description: Optional[str] = None


class PracticeTopicSummary(BaseModel):
    id: int
    slug: str
    name: str
    description: Optional[str] = None
    estimated_time_min: Optional[int] = None
    total_questions: int = 0
    completed_questions: int = 0
    mastery: Optional[float] = None


class PracticeQuestionResponse(BaseModel):
    """A single practice question."""

    question_id: int
    stem: str
    base_difficulty: str
    shown_difficulty: str  # May change based on ML adaptation


class PracticeAttemptResponse(BaseModel):
    """Response when starting a practice attempt."""

    attempt_id: int
    topic_id: int
    started_at: datetime
    current_question: PracticeQuestionResponse
    questions_completed: int = 0
    score: int = 0


class PracticeSubmitRequest(BaseModel):
    """Submit an answer for the current question."""
    answer_submitted: str
    time_seconds: Optional[float] = None


class PracticeSubmitResponse(BaseModel):
    """Response after submitting an answer."""

    is_correct: bool
    correct_answer: str
    next_question: Optional[PracticeQuestionResponse] = None
    next_difficulty: Optional[str] = None
    questions_completed: int
    score: int
    session_complete: bool = False
    mastery_updated: Optional[float] = None


class PracticeHintRequest(BaseModel):
    """Request a hint (optional body for future ML features)."""

    pass


class PracticeHintResponse(BaseModel):
    """Response with the next sequential hint."""

    hint_level: int
    hint_text: str
    hints_remaining: int
    predicted_level: Optional[int] = None  # ML prediction


# Helpers
def get_student_features(
    session: Session, user_id: int, topic_id: int, question: Question
) -> dict:
    """Calculate ML features for a student on a given topic/question."""

    # Get mastery state
    mastery_state = session.exec(
        select(MasteryState)
        .where(MasteryState.user_id == user_id)
        .where(MasteryState.topic_id == topic_id)
    ).first()

    mastery = mastery_state.mastery if mastery_state else 0.3

    # Get past interactions for this topic
    past_attempts = session.exec(
        select(PracticeAttempt).where(
            PracticeAttempt.user_id == user_id,
            PracticeAttempt.topic_id == topic_id,
        )
    ).all()

    # Calculate topic-level statistics
    total_interactions = 0
    correct_count = 0
    total_time = 0.0
    total_hints_used = 0

    for attempt in past_attempts:
        interactions = session.exec(
            select(PracticeInteraction).where(
                PracticeInteraction.attempt_id == attempt.id
            )
        ).all()

        for interaction in interactions:
            total_interactions += 1
            if interaction.is_correct:
                correct_count += 1
            if interaction.time_seconds:
                total_time += interaction.time_seconds
            total_hints_used += interaction.hints_requested

    # Calculate averages
    correct_rate_topic = (
        correct_count / total_interactions if total_interactions > 0 else 0.3
    )
    avg_time_topic = total_time / total_interactions if total_interactions > 0 else 30.0
    hints_used_topic = (
        total_hints_used / total_interactions if total_interactions > 0 else 0.5
    )

    return {
        "correct_rate_topic": correct_rate_topic,
        "avg_time_topic": avg_time_topic,
        "base_difficulty": question.base_difficulty,
        "mastery": mastery,
        "hints_used_topic": hints_used_topic,
    }


def select_next_question(
    session: Session, user_id: int, topic_id: int, completed_question_ids: List[int]
) -> tuple[Question, str]:
    """Select the next question using ML-based difficulty adaptation.

    Returns: (question, shown_difficulty)
    """

    # Get all available questions for this topic
    available_questions = session.exec(
        select(Question)
        .where(Question.topic_id == topic_id)
        .where(Question.is_quiz_only == False)
        .where(Question.id.notin_(completed_question_ids) if completed_question_ids else True)
    ).all()

    if not available_questions:
        # If all non-quiz questions completed, try quiz questions
        available_questions = session.exec(
            select(Question)
            .where(Question.topic_id == topic_id)
            .where(Question.id.notin_(completed_question_ids) if completed_question_ids else True)
        ).all()

    if not available_questions:
        raise HTTPException(status_code=404, detail="No more questions available")

    # Use ML to determine target difficulty
    # Pick a representative question to get features
    # Prefer questions the student has not seen before across past attempts.
    # Query past attempts for this user/topic and collect seen question ids.
    attempt_ids = [a.id for a in session.exec(
        select(PracticeAttempt).where(
            PracticeAttempt.user_id == user_id,
            PracticeAttempt.topic_id == topic_id,
        )
    ).all()]

    seen_question_ids: set[int] = set()
    if attempt_ids:
        interactions = session.exec(
            select(PracticeInteraction).where(PracticeInteraction.attempt_id.in_(attempt_ids))
        ).all()
        seen_question_ids = {i.question_id for i in interactions}

    unseen_questions = [q for q in available_questions if q.id not in seen_question_ids]

    # Choose a sample question for feature extraction; prefer an unseen question
    sample_question = unseen_questions[0] if unseen_questions else available_questions[0]
    features = get_student_features(session, user_id, topic_id, sample_question)

    try:
        target_difficulty = choose_difficulty(features)
    except Exception:
        # Fallback to medium if ML fails
        target_difficulty = "medium"

    # Find a question matching the target difficulty. Prefer unseen questions
    matching_questions = [q for q in available_questions if q.base_difficulty == target_difficulty]
    unseen_matching = [q for q in matching_questions if q.id not in seen_question_ids]

    if unseen_matching:
        matching_questions = unseen_matching

    if matching_questions:
        # Weight selection so unseen or often-wrong questions are more likely.
        # Build stats for candidate questions from past interactions.
        candidate_ids = [q.id for q in matching_questions]
        past_interactions_for_candidates = []
        if attempt_ids:
            past_interactions_for_candidates = session.exec(
                select(PracticeInteraction).where(
                    PracticeInteraction.attempt_id.in_(attempt_ids),
                    PracticeInteraction.question_id.in_(candidate_ids),
                )
            ).all()

        # Map question_id -> [correct_count, total_count]
        stats: dict[int, list[int]] = {qid: [0, 0] for qid in candidate_ids}
        for it in past_interactions_for_candidates:
            stats[it.question_id][1] += 1
            if it.is_correct:
                stats[it.question_id][0] += 1

        weights: list[float] = []
        for q in matching_questions:
            correct, total = stats.get(q.id, [0, 0])
            if total == 0:
                # Unseen questions get a boost
                w = 3.0
            else:
                correctness_rate = correct / total
                # The more often the user got it wrong, the higher the weight.
                # weight ranges from 0.1 (always correct) to 1.0 (always wrong)
                w = 0.1 + 0.9 * (1.0 - correctness_rate)
            weights.append(w)

        # If all weights are zero for some reason, fallback to first
        if sum(weights) == 0:
            selected_question = matching_questions[0]
        else:
            selected_question = random.choices(matching_questions, weights=weights, k=1)[0]
    else:
        # Fallback to any available question
        selected_question = available_questions[0]
        target_difficulty = selected_question.base_difficulty

    return selected_question, target_difficulty


@router.get("/topics", response_model=List[PracticeTopicSummary])
def list_practice_topics(
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Return a list of topics plus per-user mastery and progress counts."""
    topics = session.exec(select(Topic)).all()
    out: List[PracticeTopicSummary] = []

    for t in topics:
        # total non-quiz questions
        total_q = session.exec(
            select(Question).where(Question.topic_id == t.id, Question.is_quiz_only == False)
        ).all()
        total_questions = len(total_q)

        # completed questions by this user (distinct question ids answered)
        # find attempts for user/topic
        attempts = session.exec(
            select(PracticeAttempt).where(
                PracticeAttempt.user_id == user.id, PracticeAttempt.topic_id == t.id
            )
        ).all()
        completed_qids = set()
        if attempts:
            attempt_ids = [a.id for a in attempts]
            interactions = session.exec(
                select(PracticeInteraction).where(
                    PracticeInteraction.attempt_id.in_(attempt_ids),
                    PracticeInteraction.answer_submitted.isnot(None),
                )
            ).all()
            completed_qids = {i.question_id for i in interactions}

        completed_questions = len(completed_qids)

        # mastery state if present
        ms = session.exec(
            select(MasteryState).where(MasteryState.user_id == user.id, MasteryState.topic_id == t.id)
        ).first()
        mastery = round(ms.mastery, 3) if ms else None

        out.append(
            PracticeTopicSummary(
                id=t.id,
                slug=t.slug,
                name=t.name,
                description=t.description,
                estimated_time_min=t.estimated_time_min,
                total_questions=total_questions,
                completed_questions=completed_questions,
                mastery=mastery,
            )
        )

    return out


@router.get("/{topic_slug}", response_model=PracticeInfoResponse)
def get_practice_info(
    topic_slug: str = Path(..., description="Topic slug (e.g., 'expressions')"),
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Get practice information for a topic."""

    # Find topic
    topic = session.exec(select(Topic).where(Topic.slug == topic_slug)).first()
    if not topic:
        raise HTTPException(status_code=404, detail=f"Topic '{topic_slug}' not found")

    question_count = len(
        session.exec(
            select(Question)
            .where(Question.topic_id == topic.id)
            .where(Question.is_quiz_only == False)
        ).all()
    )

    return PracticeInfoResponse(
        topic_id=topic.id,
        topic_name=topic.name,
        topic_slug=topic.slug,
        total_questions=question_count,
        description=topic.description,
    )


@router.post("/{topic_slug}/attempt", response_model=PracticeAttemptResponse)
def start_practice_attempt(
    topic_slug: str = Path(..., description="Topic slug (e.g., 'expressions')"),
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Start a new practice attempt and get the first question."""

    # Find topic
    topic = session.exec(select(Topic).where(Topic.slug == topic_slug)).first()
    if not topic:
        raise HTTPException(status_code=404, detail=f"Topic '{topic_slug}' not found")

    # Create practice attempt
    attempt = PracticeAttempt(
        user_id=user.id,
        topic_id=topic.id,
        started_at=datetime.utcnow(),
        finished_at=None,
    )

    session.add(attempt)
    session.commit()
    session.refresh(attempt)

    # Get first question using ML-based selection
    first_question, shown_difficulty = select_next_question(
        session, user.id, topic.id, []
    )

    # Create initial interaction record for the first question so that
    # subsequent submit calls can find the current unanswered interaction.
    initial_interaction = PracticeInteraction(
        attempt_id=attempt.id,
        question_id=first_question.id,
        shown_difficulty=shown_difficulty,
        hints_requested=0,
        time_seconds=None,
    )
    session.add(initial_interaction)
    session.commit()
    session.refresh(initial_interaction)

    return PracticeAttemptResponse(
        attempt_id=attempt.id,
        topic_id=topic.id,
        started_at=attempt.started_at,
        current_question=PracticeQuestionResponse(
            question_id=first_question.id,
            stem=first_question.stem,
            base_difficulty=first_question.base_difficulty,
            shown_difficulty=shown_difficulty,
        ),
        questions_completed=0,
        score=0,
    )


@router.post("/{attempt_id}/submit", response_model=PracticeSubmitResponse)
def submit_practice_answer(
    attempt_id: int = Path(..., description="Practice attempt ID"),
    body: PracticeSubmitRequest = ...,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Submit an answer for the current practice question."""

    # Find the practice attempt
    attempt = session.exec(
        select(PracticeAttempt).where(PracticeAttempt.id == attempt_id)
    ).first()

    if not attempt:
        raise HTTPException(status_code=404, detail="Practice attempt not found")

    # Verify ownership
    if attempt.user_id != user.id:
        raise HTTPException(
            status_code=403, detail="You can only submit to your own practice session"
        )

    # Get current question (last interaction for this attempt)
    interactions = session.exec(
        select(PracticeInteraction)
        .where(PracticeInteraction.attempt_id == attempt_id)
        .order_by(PracticeInteraction.id.desc())
    ).all()

    # Get all completed question IDs
    completed_question_ids = [i.question_id for i in interactions if i.answer_submitted]

    current_question = None
    current_interaction = None
    shown_difficulty = "medium"

    if interactions and not interactions[0].answer_submitted:
        # There's an unanswered interaction
        current_interaction = interactions[0]
        current_question = session.exec(
            select(Question).where(Question.id == current_interaction.question_id)
        ).first()
        shown_difficulty = current_interaction.shown_difficulty
    else:
        # Need to select a new question
        current_question, shown_difficulty = select_next_question(
            session, user.id, attempt.topic_id, completed_question_ids
        )

        # Create interaction record
        current_interaction = PracticeInteraction(
            attempt_id=attempt_id,
            question_id=current_question.id,
            shown_difficulty=shown_difficulty,
            hints_requested=0,
            time_seconds=None,
        )
        session.add(current_interaction)
        session.commit()
        session.refresh(current_interaction)

    # Check answer
    user_answer = body.answer_submitted.strip().lower()
    correct_answer = current_question.answer.strip().lower()
    is_correct = user_answer == correct_answer

    # Update interaction
    current_interaction.answer_submitted = body.answer_submitted
    current_interaction.is_correct = is_correct
    # store time taken if provided by frontend (seconds)
    if getattr(body, "time_seconds", None) is not None:
        try:
            current_interaction.time_seconds = float(body.time_seconds)
        except Exception:
            # ignore invalid values
            pass
    session.add(current_interaction)

    # Debug/logging: record that we received a submit and what time was saved
    try:
        print(
            f"[practice.submit] attempt={attempt_id} question={current_question.id if current_question else None} "
            f"is_correct={is_correct} time_seconds={current_interaction.time_seconds}")
    except Exception:
        pass

    # Update mastery
    mastery_state = session.exec(
        select(MasteryState)
        .where(MasteryState.user_id == user.id)
        .where(MasteryState.topic_id == attempt.topic_id)
    ).first()

    new_mastery = None
    if mastery_state:
        new_mastery = update_mastery(mastery_state.mastery, is_correct)
        mastery_state.mastery = new_mastery
        mastery_state.last_updated = datetime.utcnow()
        session.add(mastery_state)
    else:
        new_mastery = 0.5 if is_correct else 0.2
        mastery_state = MasteryState(
            user_id=user.id,
            topic_id=attempt.topic_id,
            mastery=new_mastery,
            last_updated=datetime.utcnow(),
        )
        session.add(mastery_state)

    session.commit()

    # Calculate progress
    all_interactions = session.exec(
        select(PracticeInteraction)
        .where(PracticeInteraction.attempt_id == attempt_id)
        .where(PracticeInteraction.answer_submitted.isnot(None))
    ).all()

    questions_completed = len(all_interactions)
    score = sum(1 for i in all_interactions if i.is_correct)

    # Get next question
    completed_ids = [i.question_id for i in all_interactions]
    next_question = None
    next_difficulty = None
    session_complete = False

    try:
        next_q, next_diff = select_next_question(
            session, user.id, attempt.topic_id, completed_ids
        )
        next_question = PracticeQuestionResponse(
            question_id=next_q.id,
            stem=next_q.stem,
            base_difficulty=next_q.base_difficulty,
            shown_difficulty=next_diff,
        )
        next_difficulty = next_diff

        # Create the next interaction record
        next_interaction = PracticeInteraction(
            attempt_id=attempt_id,
            question_id=next_q.id,
            shown_difficulty=next_diff,
            hints_requested=0,
        )
        session.add(next_interaction)
        session.commit()

    except HTTPException:
        # No more questions - session complete
        session_complete = True
        attempt.finished_at = datetime.utcnow()
        session.add(attempt)
        session.commit()

    return PracticeSubmitResponse(
        is_correct=is_correct,
        correct_answer=current_question.answer,
        next_question=next_question,
        next_difficulty=next_difficulty,
        questions_completed=questions_completed,
        score=score,
        session_complete=session_complete,
        mastery_updated=round(new_mastery, 3) if new_mastery else None,
    )


@router.post("/{attempt_id}/hint", response_model=PracticeHintResponse)
def get_practice_hint(
    attempt_id: int = Path(..., description="Practice attempt ID"),
    body: Optional[PracticeHintRequest] = None,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Get the next sequential hint for the current question using ML prediction."""

    # Find the practice attempt
    attempt = session.exec(
        select(PracticeAttempt).where(PracticeAttempt.id == attempt_id)
    ).first()

    if not attempt:
        raise HTTPException(status_code=404, detail="Practice attempt not found")

    # Verify ownership
    if attempt.user_id != user.id:
        raise HTTPException(
            status_code=403, detail="You can only request hints for your own practice"
        )

    # Get current question (most recent interaction without an answer)
    interactions = session.exec(
        select(PracticeInteraction)
        .where(PracticeInteraction.attempt_id == attempt_id)
        .order_by(PracticeInteraction.id.desc())
    ).all()

    if not interactions:
        raise HTTPException(
            status_code=400, detail="No active question to provide a hint for"
        )

    current_interaction = interactions[0]

    if current_interaction.answer_submitted:
        raise HTTPException(
            status_code=400,
            detail="Question already answered. Submit next question first.",
        )

    # Get the question and its hints
    question = session.exec(
        select(Question).where(Question.id == current_interaction.question_id)
    ).first()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Get hints for this question
    hints = session.exec(
        select(QuestionHint)
        .where(QuestionHint.question_id == question.id)
        .order_by(QuestionHint.ordering)
    ).all()

    if not hints:
        raise HTTPException(status_code=404, detail="No hints available for this question")

    # Determine which hint to show. Prefer ML-predicted level when available,
    # otherwise fall back to the next sequential hint.
    hints_already_used = current_interaction.hints_requested

    # Use ML to predict best hint level (1-based level: 1,2,3)
    features = get_student_features(session, user.id, attempt.topic_id, question)
    features["hints_used_question"] = hints_already_used

    predicted_level = None
    try:
        predicted_level = predict_hint_level(**features)
    except Exception:
        # If the ML prediction fails, we'll fall back to sequential behavior below
        predicted_level = None

    # Decide which hint index to show. Convert predicted_level to 0-based index
    if predicted_level is not None:
        pred_index = int(predicted_level) - 1
        # clamp into valid hint index range
        next_hint_index = min(max(pred_index, 0), len(hints) - 1)
        # don't re-show an earlier hint the student has already seen; if the model
        # suggests an index lower than what they've already used, use the next
        # sequential hint instead
        if next_hint_index < hints_already_used:
            next_hint_index = hints_already_used
    else:
        next_hint_index = hints_already_used

    if next_hint_index >= len(hints):
        raise HTTPException(status_code=400, detail="All hints have been used")

    # Select the chosen hint
    next_hint = hints[next_hint_index]

    # Update the stored hints_requested to reflect the hint we've delivered
    # (set to at least next_hint_index+1)
    current_interaction.hints_requested = max(current_interaction.hints_requested, next_hint_index + 1)
    session.add(current_interaction)
    session.commit()

    return PracticeHintResponse(
        hint_level=next_hint_index + 1,
        hint_text=next_hint.hint_text,
        hints_remaining=len(hints) - (next_hint_index + 1),
        predicted_level=predicted_level,
    )