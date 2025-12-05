"""Inference helper for IRT-style selection.

Provides select_quiz_questions_irt(session, user_id, topic_id, k) which returns a list
of Question objects (SQLModel instances) selected by Fisher information at the student's mastery.

This module expects a params JSON at ml/models/irt_question_params.json with mapping
question_id -> {"w0": float, "w1": float}.

If the params file is missing or a question is absent from it, the selector will
fall back gracefully (assign low information and still allow the question to be selected if needed).
"""
from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from sqlmodel import Session, select

from brightsum_api.models import MasteryState, Question

ML_DIR = Path(__file__).resolve().parents[0]
PARAMS_FILE = ML_DIR / "models" / "irt_question_params.json"

_PARAMS: Optional[Dict[int, Dict[str, float]]] = None


def _load_params() -> Dict[int, Dict[str, float]]:
    global _PARAMS
    if _PARAMS is not None:
        return _PARAMS
    if not PARAMS_FILE.exists():
        _PARAMS = {}
        return _PARAMS
    try:
        with PARAMS_FILE.open("r", encoding="utf-8") as f:
            raw = json.load(f)
            _PARAMS = {int(k): {"w0": float(v["w0"]), "w1": float(v["w1"])} for k, v in raw.items()}
    except Exception:
        _PARAMS = {}
    return _PARAMS


def sigmoid(x: float) -> float:
    try:
        return 1.0 / (1.0 + math.exp(-x))
    except OverflowError:
        return 0.0 if x < 0 else 1.0


def question_info_at_mastery(qid: int, mastery: float) -> Optional[Tuple[float, float]]:
    params = _load_params()
    p = None
    info = 0.0
    if qid in params:
        w0 = params[qid]["w0"]
        w1 = params[qid]["w1"]
        x = w0 + w1 * mastery
        p = sigmoid(x)
        info = (w1 ** 2) * p * (1.0 - p)
        return p, info
    # no params -> return None so caller can decide fallback
    return None


def select_quiz_questions_irt(session: Session, user_id: int, topic_id: int, k: int = 10) -> List[Tuple[Question, float]]:
    """Select top-k questions by Fisher-style information at student's mastery.

    Returns a list of tuples (Question, info_score) where info_score is the
    Fisher-information-like score at the student's current mastery. The list
    may be fewer than k if not enough questions exist.
    """
    # Lookup mastery
    ms = session.exec(
        select(MasteryState).where(MasteryState.user_id == user_id).where(MasteryState.topic_id == topic_id)
    ).first()
    mastery = ms.mastery if ms else 0.3

    # Get all candidate questions for topic (allow quiz-only or not)
    candidates = session.exec(select(Question).where(Question.topic_id == topic_id)).all()

    scored: List[Tuple[float, Question, float]] = []  # (score, question, p_correct)
    for q in candidates:
        meta = question_info_at_mastery(q.id, mastery)
        if meta is None:
            # fallback heuristic: assign small info based on base_difficulty
            # easy -> lower info; medium/hard -> slightly higher
            diff = 0.5
            if q.base_difficulty == 'easy':
                diff = 0.2
            elif q.base_difficulty == 'medium':
                diff = 0.5
            elif q.base_difficulty == 'hard':
                diff = 0.7
            # crude p around 0.5 to let these be selectable
            p = 0.5
            info = diff * p * (1 - p)
            scored.append((info, q, p))
        else:
            p, info = meta
            scored.append((info, q, p))

    # sort by info desc
    scored.sort(key=lambda t: t[0], reverse=True)

    selected = [(q, info) for info, q, p in scored[:k]]
    return selected


if __name__ == "__main__":
    # quick local demo if run directly (not usually used in server runtime)
    from brightsum_api.db import get_session

    with get_session() as session:
        sel = select_quiz_questions_irt(session, user_id=1, topic_id=1, k=5)
        print(f"Selected {len(sel)} questions:")
        for q, info in sel:
            print(q.id, q.stem, "info=", info)
