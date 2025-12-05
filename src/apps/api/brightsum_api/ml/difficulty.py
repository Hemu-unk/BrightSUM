"""Difficulty helper logic.

This module exposes two helpers:
- `map_prob_to_difficulty(prob_correct)` — map a probability to a difficulty band.
- `choose_difficulty(features)` — try to call the correctness model to get
  probability of a correct answer and map that to a difficulty. Falls back to
  rule-based mapping when the model is unavailable or an error occurs.
"""

from __future__ import annotations

from typing import Any


def map_prob_to_difficulty(prob_correct: float) -> str:
    """Map predicted probability of a correct answer to an appropriate difficulty.

    `prob_correct` is expected in [0,1]. Returns one of "easy", "medium", "hard".
    """
    if prob_correct >= 0.8:
        return "hard"
    if prob_correct >= 0.5:
        return "medium"
    return "easy"


def choose_difficulty(features: dict[str, Any]) -> str:
    """Choose difficulty for a next question given `features`.

    Attempts to use the correctness prediction model (if available). If the
    model cannot be loaded or raises an error, the function falls back to a
    conservative rule: assume medium difficulty unless mastery and correct_rate
    indicate high skill.
    """
    try:
        # Import locally so the module doesn't hard-depend on the model at import time
        from brightsum_api.ml.correctness_inference import predict_correctness_proba

        prob = predict_correctness_proba(features)
        return map_prob_to_difficulty(prob)
    except Exception:
        # Fallback rule-based choice
        mastery = float(features.get("mastery", 0.3))
        correct_rate = float(features.get("correct_rate_topic", 0.3))
        if mastery >= 0.8 or correct_rate >= 0.85:
            return "hard"
        if mastery >= 0.4 or correct_rate >= 0.5:
            return "medium"
        return "easy"
