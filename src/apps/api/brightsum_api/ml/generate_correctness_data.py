"""Generate synthetic dataset for correctness prediction.

Writes CSV to `ml/datasets/correctness_interactions.csv`.

Features:
- correct_rate_topic (0..1)
- avg_time_topic (seconds)
- base_difficulty ("easy","medium","hard")
- mastery (0..1)
- last_hint_level_used (0..3)
- hints_used_topic (0..3)
- will_answer_correct (0|1)  # label

The label is generated from a simple noisy rule so the model
has learnable structure for demos.
"""
from __future__ import annotations

import random
from pathlib import Path
import numpy as np
import pandas as pd


OUT = Path(__file__).parent / "datasets" / "correctness_interactions.csv"


def sample_row() -> dict:
    # Base features
    correct_rate_topic = random.random()
    avg_time_topic = random.gauss(30, 10)
    avg_time_topic = max(1.0, avg_time_topic)
    base_diff = random.choices(["easy", "medium", "hard"], weights=[0.5, 0.3, 0.2])[0]
    mastery = min(1.0, max(0.0, random.random()))
    last_hint_level_used = random.choices([0, 1, 2, 3], weights=[0.5, 0.2, 0.2, 0.1])[0]
    hints_used_topic = random.random() * 2.0

    # numeric encoding for difficulty
    diff_num = {"easy": 0.0, "medium": 1.0, "hard": 2.0}[base_diff]

    # construct a latent score for probability of correctness
    # mastery and correct_rate_topic increase correctness, higher base difficulty and more hints used decrease it
    score = (
        1.2 * mastery
        + 0.9 * correct_rate_topic
        - 0.25 * diff_num
        - 0.12 * last_hint_level_used
        - 0.01 * (avg_time_topic - 20.0)
        - 0.05 * hints_used_topic
    )

    # map to probability via sigmoid
    prob = 1.0 / (1.0 + np.exp(-score))

    # add some noise
    prob = min(1.0, max(0.0, prob + np.random.normal(0, 0.05)))

    label = 1 if random.random() < prob else 0

    return {
        "correct_rate_topic": round(correct_rate_topic, 3),
        "avg_time_topic": round(avg_time_topic, 2),
        "base_difficulty": base_diff,
        "mastery": round(mastery, 3),
        "last_hint_level_used": int(last_hint_level_used),
        "hints_used_topic": round(hints_used_topic, 2),
        "will_answer_correct": int(label),
    }


def generate(n: int = 5000, out: Path | None = None) -> Path:
    out = OUT if out is None else out
    out.parent.mkdir(parents=True, exist_ok=True)

    rows = [sample_row() for _ in range(n)]
    df = pd.DataFrame(rows)
    df.to_csv(out, index=False)
    return out


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=5000)
    parser.add_argument("--out", type=str, default=str(OUT))
    args = parser.parse_args()
    path = generate(n=args.rows, out=Path(args.out))
    print(f"Wrote dataset to {path}")
