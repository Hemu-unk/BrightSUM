"""Seed sample data for Review Mistakes testing.

Run from repository root as a module so package imports resolve:

  python -m brightsum_api.seed_review_data

This will create a user 'test@email.com' (password: 'testtest') and
several topics, questions, practice attempts, interactions and quiz attempts
so the Review Mistakes page has data to display.
"""
from datetime import datetime, timedelta
from sqlmodel import Session, select

from .db import init_db, engine
from .models import User, Topic, Question, QuestionHint, PracticeAttempt, PracticeInteraction, QuizAttempt, MasteryState
from .auth import pwd


def make_user(session: Session, email: str, password: str) -> User:
    existing = session.exec(select(User).where(User.email == email)).first()
    if existing:
        print(f"User {email} already exists (id={existing.id})")
        return existing
    u = User(email=email, password_hash=pwd.hash(password), role="student")
    session.add(u)
    session.commit()
    session.refresh(u)
    print(f"Created user {email} id={u.id}")
    return u


def ensure_topic(session: Session, slug: str, name: str) -> Topic:
    t = session.exec(select(Topic).where(Topic.slug == slug)).first()
    if t:
        return t
    t = Topic(slug=slug, name=name)
    session.add(t)
    session.commit()
    session.refresh(t)
    return t


def add_question(session: Session, topic: Topic, stem: str, answer: str, difficulty: str = "medium") -> Question:
    q = Question(topic_id=topic.id, stem=stem, answer=answer, base_difficulty=difficulty, is_quiz_only=False)
    session.add(q)
    session.commit()
    session.refresh(q)
    return q


def seed():
    init_db()
    with Session(engine) as session:
        user = make_user(session, "test@email.com", "testtest")

        # Topics
        t_expressions = ensure_topic(session, "expressions", "Expressions")
        t_exponents = ensure_topic(session, "exponents", "Exponents")
        t_inequalities = ensure_topic(session, "inequalities", "Inequalities")
        t_integers = ensure_topic(session, "integers", "Integers")

        # Questions (a few per topic)
        q1 = add_question(session, t_expressions, "Simplify: 2(x + 3)", "2x + 6", "easy")
        q2 = add_question(session, t_expressions, "Evaluate: 3 + 4 * 2", "11", "easy")
        q3 = add_question(session, t_exponents, "Compute: 2^3", "8", "easy")
        q4 = add_question(session, t_inequalities, "Solve: x + 3 > 5", "x > 2", "medium")
        q5 = add_question(session, t_integers, "What is -3 + 7?", "4", "easy")

        # Practice attempt 1 (yesterday) with interactions - mixed correctness
        pa1 = PracticeAttempt(user_id=user.id, topic_id=t_expressions.id, started_at=datetime.utcnow() - timedelta(days=1))
        session.add(pa1)
        session.commit()
        session.refresh(pa1)

        pis = [
            PracticeInteraction(attempt_id=pa1.id, question_id=q1.id, shown_difficulty="easy", answer_submitted="2x+6", is_correct=True, hints_requested=0, time_seconds=12.3),
            PracticeInteraction(attempt_id=pa1.id, question_id=q2.id, shown_difficulty="easy", answer_submitted="10", is_correct=False, hints_requested=1, time_seconds=20.5),
        ]
        for p in pis:
            session.add(p)
        session.commit()

        # Practice attempt 2 (3 days ago) on inequalities with a couple mistakes
        pa2 = PracticeAttempt(user_id=user.id, topic_id=t_inequalities.id, started_at=datetime.utcnow() - timedelta(days=3))
        session.add(pa2)
        session.commit()
        session.refresh(pa2)
        pis2 = [
            PracticeInteraction(attempt_id=pa2.id, question_id=q4.id, shown_difficulty="medium", answer_submitted="x >= 2", is_correct=False, hints_requested=2, time_seconds=45.0),
        ]
        for p in pis2:
            session.add(p)
        session.commit()

        # --- Augment dataset: ensure each topic has multiple questions, practice attempts and quiz attempts ---
        import random
        all_topics = session.exec(select(Topic)).all()
        now = datetime.utcnow()

        for idx, t in enumerate(all_topics):
            # ensure at least 4 questions per topic
            qs = session.exec(select(Question).where(Question.topic_id == t.id)).all()
            while len(qs) < 4:
                q = add_question(session, t, f"{t.name} auto q {len(qs)+1}", f"ans{len(qs)+1}", random.choice(["easy","medium"]))
                qs.append(q)

            # ensure at least 4 practice attempts per topic
            existing_pas = session.exec(select(PracticeAttempt).where(PracticeAttempt.user_id == user.id, PracticeAttempt.topic_id == t.id)).all()
            need_pa = max(0, 4 - len(existing_pas))
            for n in range(need_pa):
                started = now - timedelta(days=random.randint(0, 30))
                pa = PracticeAttempt(user_id=user.id, topic_id=t.id, started_at=started)
                session.add(pa)
                session.commit()
                session.refresh(pa)
                # create between 2 and 5 interactions
                for j in range(random.randint(2, 5)):
                    q = random.choice(qs)
                    is_corr = random.random() < 0.65
                    hints = random.randint(0, 2) if not is_corr else random.randint(0, 1)
                    time_s = round(random.uniform(5.0, 60.0), 1)
                    pi = PracticeInteraction(attempt_id=pa.id, question_id=q.id, shown_difficulty=random.choice(["easy","medium","hard"]), answer_submitted=(None if is_corr else f"wrong{j}"), is_correct=is_corr, hints_requested=hints, time_seconds=time_s)
                    session.add(pi)
                session.commit()

            # ensure at least 2 quiz attempts per topic
            existing_qas = session.exec(select(QuizAttempt).where(QuizAttempt.user_id == user.id, QuizAttempt.topic_id == t.id)).all()
            need_qa = max(0, 2 - len(existing_qas))
            for n in range(need_qa):
                started = now - timedelta(days=random.randint(1, 60))
                score = random.choice([50.0, 60.0, 70.0, 80.0, 90.0])
                qa = QuizAttempt(user_id=user.id, topic_id=t.id, started_at=started, score_percent=score, passed=score >= 70.0)
                session.add(qa)
                session.commit()

            # ensure mastery exists
            existing_m = session.exec(select(MasteryState).where(MasteryState.user_id == user.id, MasteryState.topic_id == t.id)).first()
            if not existing_m:
                m = MasteryState(user_id=user.id, topic_id=t.id, mastery=round(random.uniform(0.2, 0.9), 2), last_updated=now)
                session.add(m)
                session.commit()

        print("Seeding complete. Created/ensured rich test data for sam@email.com")


if __name__ == "__main__":
    seed()
