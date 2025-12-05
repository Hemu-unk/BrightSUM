"""Build IRT dataset from DB (user_id, topic_id, question_id, mastery, is_correct).

This script is "synthetic-friendly": if the DB contains very few interactions it will
produce a small synthetic dataset so you can quickly demonstrate training.

Usage: run from repository root or from package environment (PYTHONPATH includes src/apps/api):

    python -m brightsum_api.ml.build_irt_dataset

Or:
    python src/apps/api/brightsum_api/ml/build_irt_dataset.py

Outputs: ml/datasets/irt_data.csv
"""
from __future__ import annotations

import csv
import random
from pathlib import Path
from typing import List
import math
import os

from sqlmodel import Session, select

# If the script is run from the repository root (recommended), ensure the DATABASE_URL
# points to the project's app.db inside src/apps/api. brightsum_api.db reads
# DATABASE_URL at import time, so set it here before importing the module.
candidate_db = Path(__file__).resolve().parents[2] / "app.db"  # src/apps/api/app.db
if candidate_db.exists():
    os.environ.setdefault("DATABASE_URL", f"sqlite:///{candidate_db.as_posix()}")

from brightsum_api.db import get_session, engine, init_db
from brightsum_api.models import PracticeInteraction, PracticeAttempt, MasteryState, Question
from brightsum_api.models import Topic, User

OUT_DIR = Path(__file__).resolve().parents[0] / "datasets"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_CSV = OUT_DIR / "irt_data.csv"


def extract_rows(session: Session) -> List[dict]:
    rows = []

    # join PracticeInteraction -> PracticeAttempt to get user_id & topic_id
    attempts = session.exec(select(PracticeAttempt)).all()
    attempt_map = {a.id: a for a in attempts}

    interactions = session.exec(select(PracticeInteraction)).all()

    for it in interactions:
        if it.is_correct is None:
            continue
        att = attempt_map.get(it.attempt_id)
        if not att:
            continue
        # Get latest mastery for user/topic if available
        ms = session.exec(
            select(MasteryState)
            .where(MasteryState.user_id == att.user_id)
            .where(MasteryState.topic_id == att.topic_id)
        ).first()
        mastery = ms.mastery if ms else 0.3

        rows.append({
            "user_id": att.user_id,
            "topic_id": att.topic_id,
            "question_id": it.question_id,
            "mastery": mastery,
            "is_correct": int(bool(it.is_correct)),
        })

    return rows


def make_synthetic_rows(session: Session, num_students: int = 300, seed: int | None = None) -> List[dict]:
    """Generate synthetic IRT-style rows.

    For each question:
      - sample difficulty b ~ Normal(0,1)
      - sample discrimination a ~ Uniform(0.5, 2.0)
    For each of num_students:
      - sample student mastery theta ~ Uniform(0,1)
      - compute p = sigmoid(a * (theta - b))
      - sample is_correct ~ Bernoulli(p)

    Returns rows with fields: user_id, topic_id, question_id, mastery, is_correct
    """
    if seed is not None:
        random.seed(seed)

    rows: List[dict] = []
    questions = session.exec(select(Question)).all()
    if not questions:
        return rows

    # For reproducibility use random module; use math.exp for sigmoid
    def sigmoid(x: float) -> float:
        try:
            return 1.0 / (1.0 + math.exp(-x))
        except OverflowError:
            return 0.0 if x < 0 else 1.0

    for q in questions:
        # sample item parameters
        b = random.gauss(0.0, 1.0)  # difficulty
        a = random.uniform(0.5, 2.0)  # discrimination

        for student_idx in range(1, num_students + 1):
            theta = random.random()  # uniform(0,1)
            x = a * (theta - b)
            p = sigmoid(x)
            is_corr = 1 if random.random() < p else 0
            rows.append({
                "user_id": student_idx,
                "topic_id": q.topic_id,
                "question_id": q.id,
                "mastery": theta,
                "is_correct": is_corr,
            })

    return rows


def write_csv(rows: List[dict], path: Path = OUT_CSV):
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["user_id", "topic_id", "question_id", "mastery", "is_correct"])
        writer.writeheader()
        for r in rows:
            writer.writerow(r)


def main():
    # get_session is a FastAPI dependency generator; for local scripts use Session(engine)
    # Ensure tables exist (init_db creates tables if missing)
    init_db()
    from sqlmodel import Session as _Session
    with _Session(engine) as session:
        # Ensure we have at least one topic and some questions for demo purposes
        questions = session.exec(select(Question)).all()
        if not questions:
            print("No questions found in DB — creating demo topic, questions, and users for dataset generation")
            # Ensure a demo topic
            demo_topic = session.exec(select(Topic).where(Topic.slug == 'demo-topic')).first()
            if not demo_topic:
                demo_topic = Topic(slug='demo-topic', name='Demo Topic', description='Automatically added demo topic')
                session.add(demo_topic)
                session.commit()
                session.refresh(demo_topic)

            # Create some demo questions
            demo_questions = []
            for i in range(1, 13):
                q = Question(topic_id=demo_topic.id, stem=f"Demo question {i}", answer="42", base_difficulty=('easy' if i%3==0 else 'medium' if i%3==1 else 'hard'), is_quiz_only=(i%4==0))
                session.add(q)
                demo_questions.append(q)
            session.commit()

            # Create some demo users and mastery states
            demo_users = []
            for uidx in range(1, 6):
                user = User(email=f"demo{uidx}@example.com", password_hash=f"demohash{uidx}")
                session.add(user)
                demo_users.append(user)
            session.commit()

            # Refresh users and questions to get IDs
            for user in demo_users:
                session.refresh(user)
            for q in demo_questions:
                session.refresh(q)

            # Create mastery states for users on the demo topic
            from datetime import datetime
            for user in demo_users:
                ms = MasteryState(user_id=user.id, topic_id=demo_topic.id, mastery=0.3 + (user.id % 5) * 0.12, last_updated=datetime.utcnow())
                session.add(ms)
            session.commit()

        rows = extract_rows(session)

        # Generate a fresh synthetic IRT-style dataset (200-500 students per question)
        print("Generating synthetic IRT-style dataset (this will replace DB-derived rows)")
        synth = make_synthetic_rows(session, num_students=300)
        rows = synth

        write_csv(rows)
        print(f"Wrote {len(rows)} rows to {OUT_CSV}")


if __name__ == "__main__":
    main()
