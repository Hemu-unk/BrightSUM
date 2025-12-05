"""Runtime loader and helper for the correctness model.

Provides `predict_correctness_proba(features) -> float` which returns
probability that the student will answer correctly (0.0..1.0).
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import pandas as pd


_MODEL = None


def _model_path() -> Path:
    return Path(__file__).parent / "models" / "correctness_model.joblib"


def load_model():
    global _MODEL
    p = _model_path()
    if _MODEL is None:
        if not p.exists():
            raise FileNotFoundError(f"Correctness model not found at {p}. Train it first.")
        _MODEL = joblib.load(p)
    return _MODEL


def predict_correctness_proba(features: dict[str, Any]) -> float:
    """Return probability of correct answer for a single example.

    `features` should include the same columns as the training data, e.g.
    {
      "correct_rate_topic": 0.3,
      "avg_time_topic": 45.0,
      "base_difficulty": "hard",
      "mastery": 0.2,
      "last_hint_level_used": 1,
      "hints_used_topic": 1.3,
    }
    """
    model = load_model()
    df = pd.DataFrame([features])
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(df)[0]
        # assume positive class is labeled 1
        # find index of class 1
        classes = model.classes_
        try:
            idx = list(classes).index(1)
        except ValueError:
            # fallback: take second column
            idx = 1 if len(proba) > 1 else 0
        return float(proba[idx])
    # fallback for models without predict_proba
    pred = model.predict(df)[0]
    return float(pred)
