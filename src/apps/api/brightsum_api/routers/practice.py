from __future__ import annotations

from typing import Dict, Optional, Any

from fastapi import APIRouter, Path
from pydantic import BaseModel, Field

from brightsum_api.ml.hint_inference import _load_model, predict_hint_level

router = APIRouter()


class PracticeHintRequest(BaseModel):
    """Payload the frontend can send when requesting a hint during practice.

    Either provide explicit feature overrides (useful for testing), or leave them out
    and the router will use sample/test data. In the full integration this should
    be populated from the DB (attempt/question/mastery statistics).
    """

    # optional test features (if omitted, router uses sample values)
    correct_rate_topic: Optional[float] = Field(None, ge=0.0, le=1.0)
    avg_time_topic: Optional[float] = Field(None, ge=0.0)
    base_difficulty: Optional[str] = Field(None)
    mastery: Optional[float] = Field(None, ge=0.0, le=1.0)
    hints_used_topic: Optional[float] = Field(None, ge=0.0)
    hints_used_question: Optional[int] = Field(0, ge=0)


class PracticeHintResponse(BaseModel):
    predicted_level: int
    hint_text: str
    probabilities: Dict[str, float]
    used_features: Dict[str, Any]


@router.post("/{attempt_id}/hint", response_model=PracticeHintResponse)
def request_hint(
    attempt_id: int = Path(..., ge=1),
    body: PracticeHintRequest | None = None,
):
    """Return a hint for the given practice attempt.

    This is a DB-free test implementation that accepts feature values in the
    request body (or falls back to sample values). It uses the trained hint
    model to pick a hint level and returns a short hint text appropriate for the level.
    """
    # Sample fallback features (used when frontend hasn't wired DB yet)
    defaults = {
        "correct_rate_topic": 0.4,
        "avg_time_topic": 30.0,
        "base_difficulty": "medium",
        "mastery": 0.35,
        "hints_used_topic": 0.8,
        "hints_used_question": 0,
    }

    # Merge provided features with defaults
    features = {}
    for k, v in defaults.items():
        val = getattr(body, k, None) if body is not None else None
        features[k] = v if val is None else val

    # Call the ML helper to get predicted level
    level = predict_hint_level(
        correct_rate_topic=features["correct_rate_topic"],
        avg_time_topic=features["avg_time_topic"],
        base_difficulty=features["base_difficulty"],
        mastery=features["mastery"],
        hints_used_topic=features["hints_used_topic"],
        hints_used_question=int(features["hints_used_question"]),
    )

    # Load model to obtain probabilities if available
    model = _load_model()
    import pandas as pd

    X = pd.DataFrame([
        {
            "correct_rate_topic": float(features["correct_rate_topic"]),
            "avg_time_topic": float(features["avg_time_topic"]),
            "mastery": float(features["mastery"]),
            "hints_used_topic": float(features["hints_used_topic"]),
            "hints_used_question": int(features["hints_used_question"]),
            "base_difficulty": features["base_difficulty"],
        }
    ])

    try:
        proba = model.predict_proba(X)[0]
        classes = list(map(str, model.classes_.tolist()))
        prob_map = {classes[i]: float(proba[i]) for i in range(len(classes))}
    except Exception:
        prob_map = {}

    # Simple mapping from level -> hint text (stubs for frontend)
    sample_hints = {
        1: "Small nudge: try re-reading the question and identify the variable terms.",
        2: "Hint: remember the distributive property a(b + c) = ab + ac; try applying it.",
        3: "Detailed hint: break the problem into steps: 1) isolate the variable, 2) simplify like terms, 3) solve for the variable.",
    }

    hint_text = sample_hints.get(int(level), sample_hints[2])

    return PracticeHintResponse(
        predicted_level=int(level),
        hint_text=hint_text,
        probabilities=prob_map,
        used_features={k: float(features[k]) if k != "base_difficulty" else features[k] for k in features},
    )
