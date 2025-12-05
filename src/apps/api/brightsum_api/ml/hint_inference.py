"""Runtime inference for the hint-level model.

The backend will call predict_hint_level(...) during practice sessions.
"""

from __future__ import annotations

from pathlib import Path
from typing import Literal

import joblib
import pandas as pd

BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / "models" / "hint_model.joblib"

_model = None


def _load_model():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model


HintLevel = Literal[1, 2, 3]


def predict_hint_level(
    *,
    correct_rate_topic: float,
    avg_time_topic: float,
    base_difficulty: str,
    mastery: float,
    hints_used_topic: float,
    hints_used_question: int,
) -> HintLevel:
    """Return the predicted ideal hint level (1, 2, or 3) for the current interaction.

    All arguments should already be normalized to the ranges used in training:
    - rates/mastery in [0, 1]
    - avg_time_topic in seconds (roughly 10–60)
    - base_difficulty in {"easy","medium","hard"}
    - hints_* reasonably small numbers (0–3)
    """
    model = _load_model()

    row = {
        "correct_rate_topic": float(correct_rate_topic),
        "avg_time_topic": float(avg_time_topic),
        "mastery": float(mastery),
        "hints_used_topic": float(hints_used_topic),
        "hints_used_question": int(hints_used_question),
        "base_difficulty": base_difficulty,
    }
    X = pd.DataFrame([row])
    pred = model.predict(X)[0]
    return int(pred)  # type: ignore[return-value]
