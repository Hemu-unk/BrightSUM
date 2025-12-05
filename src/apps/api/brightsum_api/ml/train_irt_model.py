"""Train per-question logistic models (is_correct ~ mastery) and save parameters.

This script reads ml/datasets/irt_data.csv produced by build_irt_dataset.py and fits a
small logistic model per question when enough rows exist. Parameters are saved as JSON
mapping question_id -> {"w0": ..., "w1": ...}.

Usage:
    python -m brightsum_api.ml.train_irt_model

If sklearn is not available a lightweight fallback estimator is used.
"""
from __future__ import annotations

import csv
import json
from collections import defaultdict
from math import log
from pathlib import Path
from typing import Dict, List, Tuple

try:
    from sklearn.linear_model import LogisticRegression
    SKLEARN_AVAILABLE = True
except Exception:
    SKLEARN_AVAILABLE = False

ML_DIR = Path(__file__).resolve().parents[0]
DATA_CSV = ML_DIR / "datasets" / "irt_data.csv"
OUT_DIR = ML_DIR / "models"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_JSON = OUT_DIR / "irt_question_params.json"

MIN_ROWS_PER_QUESTION = 8


def read_csv(path: Path) -> List[dict]:
    rows = []
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")
    with path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append({
                "user_id": int(r["user_id"]),
                "topic_id": int(r["topic_id"]),
                "question_id": int(r["question_id"]),
                "mastery": float(r["mastery"]),
                "is_correct": int(r["is_correct"]),
            })
    return rows


def fit_logistic_per_question(rows: List[dict]) -> Dict[int, Tuple[float, float]]:
    # group by question_id
    groups = defaultdict(list)
    for r in rows:
        groups[r["question_id"]].append(r)

    params = {}

    for qid, qrows in groups.items():
        if len(qrows) < MIN_ROWS_PER_QUESTION:
            # skip small groups: we'll fill later with fallback
            continue
        X = [[r["mastery"]] for r in qrows]
        y = [r["is_correct"] for r in qrows]

        if SKLEARN_AVAILABLE:
            try:
                model = LogisticRegression(penalty='l2', solver='lbfgs')
                model.fit(X, y)
                # scikit's LogisticRegression stores coef_ and intercept_
                w1 = float(model.coef_[0][0])
                w0 = float(model.intercept_[0])
                params[qid] = (w0, w1)
            except Exception as e:
                # fallback to simple analytic estimate
                params[qid] = analytic_estimate(qrows)
        else:
            params[qid] = analytic_estimate(qrows)

    return params


def analytic_estimate(qrows: List[dict]) -> Tuple[float, float]:
    # Very simple fallback: use average mastery and average correctness
    # then set w1 to 1.0 and compute w0 via logit(p) - w1*mean_mastery
    mean_m = sum(r["mastery"] for r in qrows) / len(qrows)
    mean_p = sum(r["is_correct"] for r in qrows) / len(qrows)
    # clamp
    eps = 1e-3
    mean_p = max(min(mean_p, 1 - eps), eps)
    w1 = 1.0
    w0 = log(mean_p / (1 - mean_p)) - w1 * mean_m
    return (w0, w1)


def fill_fallbacks(params: Dict[int, Tuple[float, float]], rows: List[dict]) -> Dict[int, Tuple[float, float]]:
    # ensure every seen question has params; for missing, create a weak default
    seen_qids = {r["question_id"] for r in rows}
    for q in seen_qids:
        if q not in params:
            # fallback: use overall mean p and a small slope
            qrows = [r for r in rows if r["question_id"] == q]
            if not qrows:
                params[q] = (0.0, 1.0)
                continue
            mean_m = sum(r["mastery"] for r in qrows) / len(qrows)
            mean_p = sum(r["is_correct"] for r in qrows) / len(qrows)
            # clamp
            eps = 1e-3
            mean_p = max(min(mean_p, 1 - eps), eps)
            w1 = 1.0
            w0 = log(mean_p / (1 - mean_p)) - w1 * mean_m
            params[q] = (w0, w1)
    return params


def save_params(params: Dict[int, Tuple[float, float]], out: Path = OUT_JSON):
    out_dict = {str(q): {"w0": float(w0), "w1": float(w1)} for q, (w0, w1) in params.items()}
    with out.open("w", encoding="utf-8") as f:
        json.dump(out_dict, f, indent=2)


def main():
    rows = read_csv(DATA_CSV)
    params = fit_logistic_per_question(rows)
    params = fill_fallbacks(params, rows)
    save_params(params)
    print(f"Wrote {len(params)} question parameter entries to {OUT_JSON}")


if __name__ == "__main__":
    main()
