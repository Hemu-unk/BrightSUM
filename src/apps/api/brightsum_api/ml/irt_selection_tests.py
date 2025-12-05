"""Quick tests for IRT selector behavior.

Checks:
- params file exists and has entries
- for a chosen topic, selector returns k items where k < total_questions
- info scores are floats and sorted descending
- selected questions are unique and a subset of topic questions

Exit code 0 on pass, 2 on fail.
"""
from pathlib import Path
import os
import sys
import json

ML_DIR = Path(__file__).resolve().parents[0]
PROJECT_API_DIR = Path(__file__).resolve().parents[2]
# point to repo's app.db if present
candidate_db = PROJECT_API_DIR / "app.db"
if candidate_db.exists():
    os.environ.setdefault("DATABASE_URL", f"sqlite:///{candidate_db.as_posix()}")

from sqlmodel import Session, select
from brightsum_api.db import init_db, engine
from brightsum_api.ml.irt_selection import select_quiz_questions_irt
from brightsum_api.models import Topic, Question, User


def fail(msg: str):
    print("FAIL:", msg)
    sys.exit(2)


def main():
    init_db()

    params_file = ML_DIR / "models" / "irt_question_params.json"
    if not params_file.exists():
        fail(f"Params file not found: {params_file}")

    with params_file.open("r", encoding="utf-8") as f:
        params = json.load(f)
    if len(params) == 0:
        fail("No parameter entries found in params file")

    with Session(engine) as session:
        topic = session.exec(select(Topic)).first()
        if not topic:
            fail("No topic found in DB")

        # count questions for the topic
        topic_qs = session.exec(select(Question).where(Question.topic_id == topic.id)).all()
        N = len(topic_qs)
        if N == 0:
            fail(f"No questions found for topic id {topic.id}")

        # pick k smaller than N to ensure selector must pick subset
        k = min(8, max(1, N - 3))
        print(f"Topic {topic.slug} has {N} questions; requesting k={k}")

        # pick or create a user
        user = session.exec(select(User)).first()
        if not user:
            # create one
            user = User(email="testuser@example.com", password_hash="x")
            session.add(user)
            session.commit()
            session.refresh(user)
            print("Created test user id=", user.id)

        sel = select_quiz_questions_irt(session, user.id, topic.id, k=k)
        if not sel:
            fail("Selector returned no questions")

        if len(sel) != k:
            fail(f"Selector returned {len(sel)} items but expected {k}")

        # check subset
        sel_qids = [q.id for q, info in sel]
        if len(set(sel_qids)) != len(sel_qids):
            fail("Selected question ids are not unique")

        topic_qids = {q.id for q in topic_qs}
        if not set(sel_qids).issubset(topic_qids):
            fail("Selected questions include ids not in topic")

        # check infos
        infos = [info for (_q, info) in sel]
        if any(not isinstance(i, float) for i in infos):
            fail("One or more info scores are not floats")

        # check descending
        for i in range(1, len(infos)):
            if infos[i] > infos[i-1] + 1e-9:
                fail("Info scores not sorted descending")

        print("Selector behavior checks passed")

    print("ALL TESTS PASSED")

if __name__ == '__main__':
    main()
