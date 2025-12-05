"""Generate synthetic training data for the hint-level prediction model.

Each row represents one student-question interaction.
The label is which hint level (1, 2, or 3) would have been most helpful.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

RNG = np.random.default_rng(seed=42)

OUT_DIR = Path(__file__).parent / "datasets"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_PATH = OUT_DIR / "hint_interactions.csv"


def sample_student_profile() -> dict:
    """Simulate an underlying student "ability" profile.

    Returns base values for:
    - mastery (0..1)
    - correct_rate_topic (0..1)
    - avg_time_topic (seconds)
    - hints_used_topic (historical avg)
    """
    # Simple mixture of three groups: struggling, mid, strong
    group = RNG.choice(["struggling", "mid", "strong"], p=[0.35, 0.4, 0.25])

    if group == "struggling":
        mastery = float(RNG.beta(1.5, 4.0))  # low
        correct_rate = float(RNG.beta(1.2, 3.5))
        avg_time = float(RNG.normal(40, 8))  # takes longer
        hints_topic = max(0.0, RNG.normal(1.8, 0.7))
    elif group == "strong":
        mastery = float(RNG.beta(4.0, 1.2))  # high
        correct_rate = float(RNG.beta(3.0, 1.2))
        avg_time = float(RNG.normal(18, 5))  # faster
        hints_topic = max(0.0, RNG.normal(0.3, 0.3))
    else:  # mid
        mastery = float(RNG.beta(2.5, 2.5))
        correct_rate = float(RNG.beta(2.0, 2.2))
        avg_time = float(RNG.normal(28, 6))
        hints_topic = max(0.0, RNG.normal(1.0, 0.5))

    avg_time = float(max(5.0, min(avg_time, 60.0)))
    hints_topic = float(min(hints_topic, 3.0))

    return {
        "mastery": mastery,
        "correct_rate_topic": correct_rate,
        "avg_time_topic": avg_time,
        "hints_used_topic": hints_topic,
    }


def sample_interaction_row() -> dict:
    profile = sample_student_profile()

    base_difficulty = RNG.choice(["easy", "medium", "hard"], p=[0.4, 0.4, 0.2])
    hints_used_question = int(RNG.integers(0, 3))  # hints already used so far

    row = {
        **profile,
        "base_difficulty": base_difficulty,
        "hints_used_question": hints_used_question,
    }

    # --- Latent rule to decide ideal hint level (label) ---
    mastery = profile["mastery"]
    correct_rate = profile["correct_rate_topic"]
    avg_time = profile["avg_time_topic"]
    hints_topic = profile["hints_used_topic"]

    # Normalize time to [0,1] scale ~ [10,60] seconds roughly
    time_norm = min(1.0, max(0.0, (avg_time - 10.0) / 50.0))

    # Base score: higher means less support needed
    skill_score = 0.5 * mastery + 0.3 * correct_rate + 0.2 * (1.0 - time_norm)

    # Adjust for difficult questions
    if base_difficulty == "hard":
        skill_score -= 0.15
    elif base_difficulty == "medium":
        skill_score -= 0.05

    # Adjust for heavy hint usage on topic
    if hints_topic > 1.5:
        skill_score -= 0.1

    # Adjust if they already used hints on this question
    if hints_used_question >= 2:
        skill_score -= 0.2

    # Convert to hint level: 1 = light nudge, 3 = very detailed
    if skill_score >= 0.65:
        label = 1
    elif skill_score >= 0.4:
        label = 2
    else:
        label = 3

    row["label_hint_level"] = label
    return row


def main(n_samples: int = 5000) -> None:
    rows = [sample_interaction_row() for _ in range(n_samples)]
    df = pd.DataFrame(rows)

    df.to_csv(OUT_PATH, index=False)
    print(f"Wrote {len(df)} rows to {OUT_PATH}")


if __name__ == "__main__":
    main()
