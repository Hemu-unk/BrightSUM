# SQLModel tables

from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint  # sqlmodel 0.0.22

# Creates the User table
class User(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("email"),)
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True)
    password_hash: str
    role: str = Field(default="student", index=True)
    # created_at: datetime = Field(default_factory=datetime.utcnow) | possible field, maybe for later


# Verification table to store one-time codes for email verification.
class Verification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True)
    code: str
    expires_at: Optional[datetime] = None


# PasswordReset table to store one-time codes for resetting passwords.
class PasswordReset(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True)
    code: str
    expires_at: Optional[datetime] = None

# DB Design below | Based off DevPlan

#Topic/Lesson
class Topic(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True)  # "expressions", "exponents", ...
    name: str                                   # what the UI can call "lesson title"
    description: Optional[str] = None
    estimated_time_min: Optional[int] = None    # from the issue template
    objectives: Optional[str] = None            # from the issue


# Lesson Slide table - Links with Topic with foreign key topic_id
class LessonSlide(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("topic_id", "index"),) # Means we must have a unique index for a topic_id, no duplicate topic_id's and indexes

    id: Optional[int] = Field(default=None, primary_key=True)
    topic_id: int = Field(foreign_key="topic.id", index=True)
    index: int  # slide order within topic (1,2,3,...)
    title: str
    body: str   # slide content (markdown / text)

# Reusable problem relating to a topic, FK on topic_id
class Question(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    topic_id: int = Field(foreign_key="topic.id", index=True)
    stem: str               # question text
    answer: str             # correct answer (string for now)
    base_difficulty: str = Field(index=True)  # "easy" | "medium" | "hard"
    is_quiz_only: bool = Field(default=False) # False => can be used in practice too


# Hints associated with a question. Each hint has an optional level (1..3), an order,
# and the hint text. Stored separately so multiple hints can be attached to a question.
class QuestionHint(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    question_id: int = Field(foreign_key="question.id", index=True)
    level: Optional[int] = None
    hint_text: str
    """Order of the hint for presentation (1,2,3...). Lower numbers are shown first."""
    ordering: int = 0


# The block of time dedicated to practice questions, FK's on topic_id and user_id
class PracticeAttempt(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    topic_id: int = Field(foreign_key="topic.id", index=True)
    started_at: datetime
    finished_at: Optional[datetime] = None

# Essentially a log of a single question during a practice session, FK's on practiceattempt_id and question_id
class PracticeInteraction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    attempt_id: int = Field(foreign_key="practiceattempt.id", index=True)
    question_id: int = Field(foreign_key="question.id", index=True)
    shown_difficulty: str                    # "medium", "hard" (ie attempt_id = X for question_id = Y)
    answer_submitted: Optional[str] = None
    is_correct: Optional[bool] = None
    hints_requested: int = 0
    time_seconds: Optional[float] = None     # time taken on this question

# A single quiz run for one user on one topic
class QuizAttempt(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    topic_id: int = Field(foreign_key="topic.id", index=True)
    started_at: datetime
    finished_at: Optional[datetime] = None
    score_percent: Optional[float] = None
    passed: Optional[bool] = None


# Mapping table to record which questions were selected for a QuizAttempt
class QuizAttemptQuestion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    attempt_id: int = Field(foreign_key="quizattempt.id", index=True)
    question_id: int = Field(foreign_key="question.id", index=True)
    position: Optional[int] = None  # order in the quiz
    info_score: Optional[float] = None  # optional information score from selector
    # Persisted quiz response details (filled at submit time)
    is_correct: Optional[bool] = None
    given_answer: Optional[str] = None
    time_seconds: Optional[float] = None
    hints_requested: Optional[int] = None

# How well a user knows a given topic - FK's on user_id and topic_id
class MasteryState(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    topic_id: int = Field(foreign_key="topic.id", index=True)
    mastery: float  # 0.0–1.0
    last_updated: datetime