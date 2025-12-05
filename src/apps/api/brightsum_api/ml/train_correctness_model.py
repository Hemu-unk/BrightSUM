"""Train a correctness prediction model and save it to ml/models/correctness_model.joblib.

Usage:
  python -m brightsum_api.ml.train_correctness_model
or
  .venv\Scripts\python.exe -m brightsum_api.ml.train_correctness_model
"""
from __future__ import annotations

from pathlib import Path
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report


ROOT = Path(__file__).parent
DATA = ROOT / "datasets" / "correctness_interactions.csv"
OUT = ROOT / "models" / "correctness_model.joblib"


def build_pipeline() -> Pipeline:
    numeric = ["correct_rate_topic", "avg_time_topic", "mastery", "last_hint_level_used", "hints_used_topic"]
    categorical = ["base_difficulty"]

    pre = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
        ]
    )

    # RandomForest is robust for small synthetic datasets; fall back to LogisticRegression if desired
    clf = RandomForestClassifier(n_estimators=100, random_state=42)

    return Pipeline(steps=[("pre", pre), ("clf", clf)])


def train_and_save(path: Path = DATA, out: Path = OUT) -> None:
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found at {path}. Run generate_correctness_data.py first.")

    df = pd.read_csv(path)
    X = df.drop(columns=["will_answer_correct"])
    y = df["will_answer_correct"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipe = build_pipeline()
    pipe.fit(X_train, y_train)

    preds = pipe.predict(X_test)
    prob_preds = pipe.predict_proba(X_test)[:, 1]
    acc = accuracy_score(y_test, preds)
    print(f"Test accuracy: {acc:.4f}")
    print(classification_report(y_test, preds))

    out.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipe, out)
    print(f"Saved model to {out}")


if __name__ == "__main__":
    train_and_save()
