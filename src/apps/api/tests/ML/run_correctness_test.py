"""Smoke test for the correctness ML pipeline.

This script does the following:
- generate a small synthetic correctness dataset
- train the correctness model
- load the model and call the inference helper on a sample feature row

Run from `src/apps/api` with the project venv activated.
"""
import sys
import traceback
from pathlib import Path

# Ensure the API package folder is on sys.path when running this file directly.
# Location: tests/ML/run_correctness_smoke.py -> we want src/apps/api on sys.path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from brightsum_api.ml.generate_correctness_data import generate
from brightsum_api.ml.train_correctness_model import train_and_save
from brightsum_api.ml.correctness_inference import predict_correctness_proba


def main():
    try:
        print("Generating small dataset (200 rows)...")
        path = generate(n=200)
        print(f"Dataset written to: {path}")

        print("Training correctness model (this may take a moment)...")
        train_and_save()

        sample = {
            "correct_rate_topic": 0.35,
            "avg_time_topic": 40.0,
            "base_difficulty": "hard",
            "mastery": 0.25,
            "last_hint_level_used": 1,
            "hints_used_topic": 1.2,
        }

        print("Running inference on sample:")
        print(sample)
        prob = predict_correctness_proba(sample)
        print(f"Predicted probability of correctness: {prob}")
        assert 0.0 <= prob <= 1.0
        print("Smoke test passed: probability in [0,1]")

    except Exception:
        print("Smoke test failed:")
        traceback.print_exc()


if __name__ == "__main__":
    main()
