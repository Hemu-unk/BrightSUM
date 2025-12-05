BrightSUM ML

Summary of files
- `generate_hint_data.py` — create a synthetic dataset at `datasets/hint_interactions.csv`.
- `train_hint_model.py` — train a scikit-learn Pipeline and save to `models/hint_model.joblib`.
- `hint_inference.py` — runtime loader and public helper `predict_hint_level(...)`.
- `mastery.py` — simple incremental mastery update helper (pure Python logic).
- `difficulty.py` — small rule-based mapping from correctness probability → difficulty.
- `generate_correctness_data.py` — create a synthetic correctness dataset at `datasets/correctness_interactions.csv`.
- `train_correctness_model.py` — train a scikit-learn Pipeline and save to `models/correctness_model.joblib`.
- `correctness_inference.py` — runtime loader and helper `predict_correctness_proba(...)`.

New integration helpers (routers)
- `src/apps/api/brightsum_api/routers/ml_debug.py` — temporary FastAPI endpoint POST `/api/ml/hint` that accepts feature JSON and returns predicted hint level and class probabilities. Useful for frontend/QA/demo.
- `src/apps/api/brightsum_api/routers/practice.py` — temporary DB-free practice router with POST `/api/practice/{attempt_id}/hint`. Accepts optional feature values, calls the model, and returns a sample hint text (ready for frontend integration).

Quickstart (using the project venv created by `setup.cmd`)

Run these commands from the repository root. The examples assume you have already created and activated the project's virtual environment (see `setup.cmd`).

1) Change into the API package folder and generate synthetic data for the hint model:

```bat
cd src\apps\api
.venv\Scripts\python.exe -m brightsum_api.ml.generate_hint_data --rows 5000
```

This writes `ml/datasets/hint_interactions.csv` (default 5000 rows).

1b) Generate the correctness dataset:

```bat
cd src\apps\api
.venv\Scripts\python.exe -m brightsum_api.ml.generate_correctness_data --rows 5000
```

This writes `ml/datasets/correctness_interactions.csv` (default 5000 rows).

2) Train the hint model:

```bat
cd src\apps\api
.venv\Scripts\python.exe -m brightsum_api.ml.train_hint_model
```

This writes `ml/models/hint_model.joblib` and prints a classification report.

2b) Train the correctness model:

```bat
cd src\apps\api
.venv\Scripts\python.exe -m brightsum_api.ml.train_correctness_model
```

This writes `ml/models/correctness_model.joblib` and prints test metrics. The trainer uses a RandomForest pipeline.

3) Start the backend and test the endpoints

Start the backend (you can use `start-dev.cmd` or run directly):

```bat
cd /d C:\Users\nolan\Documents\Uni\F25\Systems\BrightSUM\src\apps\api
.venv\Scripts\python.exe -m uvicorn brightsum_api.main:app --reload --port 8001
```

Endpoints you can use now (DB-free)
- POST `/api/ml/hint` — raw ML debug endpoint. Accepts the feature JSON and returns:
  - `predicted_level` (1|2|3)
  - `probabilities` (map of class→probability)
  - `input` (echo of submitted features)
- POST `/api/practice/{attempt_id}/hint` — practice-specific endpoint (temporary). Accepts the same features (optional) and returns:
  - `predicted_level` (1|2|3)
  - `hint_text` — a short, frontend-friendly hint string (stubbed) for the predicted level
  - `probabilities` — model class probs
  - `used_features` — the feature values used for the prediction

Example request body

```json
{
  "correct_rate_topic": 0.3,
  "avg_time_topic": 40.0,
  "base_difficulty": "hard",
  "mastery": 0.2,
  "hints_used_topic": 1.5,
  "hints_used_question": 2
}
```

Example response from `/api/practice/1/hint` (formatted)

```json
{
  "predicted_level": 3,
  "hint_text": "Detailed hint: break the problem into steps...",
  "probabilities": {"1": 6.3e-17, "2": 4.0e-07, "3": 0.9999996},
  "used_features": {"correct_rate_topic": 0.3, "avg_time_topic": 40.0, "base_difficulty": "hard", ...}
}
```

Developer notes & expectations

- This implementation is intentionally lightweight. It does not modify the DB or require authentication at the moment.
- The current `hint_inference.py` exposes `predict_hint_level(...)`. For probabilities we currently call an internal `_load_model()` to access `predict_proba`. If you prefer, add a stable API in `hint_inference.py` such as `predict_with_proba(...)` and use that from the routers.
- Pydantic v2 is used in this backend; prefer `Field(..., pattern=...)`.

Checklist before pushing changes

1. Run the ML pipeline locally:
    - Generate dataset
    - Train model
    - Start backend and call `/api/practice/1/hint`
2. Ensure the project venv is used when running scripts (see `setup.cmd`).
3. Keep changes small and document any API shape changes in this file.
4. Add unit tests for:
    - `ml/mastery.update_mastery`
    - `ml/hint_inference.predict_hint_level` (use a tiny synthetic sample or mock the model)
5. If adding DB-backed hint content, include a migration or seed script to populate example hints for at least one topic.



IRT model (item selection)
--------------------------

We also experimented with an Item Response Theory (IRT) style selection pipeline to choose practice questions that match a learner's current ability. Key files related to this work are in the same `ml/` folder:

- `build_irt_dataset.py` — helpers to construct an IRT-style dataset from interaction logs (uses correctness interactions, timestamps and simple user/question features).
- `train_irt_model.py` — training script for the IRT selection model; run this after building the dataset. Trained artifacts are written to `ml/models/`.
- `irt_selection.py` — selection helpers that compute item difficulty and estimate student ability, and return recommended next items based on those estimates.
- `irt_selection_tests.py` — small unit/integration checks used during development to validate selection logic.

How it's used: at a high level the IRT pipeline ingests past correctness interactions, estimates per-item difficulty and per-student ability, then selects items that target the student's current ability (not too easy, not too hard). For demo and development the selection helpers are used in isolation (they can be plugged into a router or used by the frontend through a backend API). See the scripts above for commands to build datasets and train models locally.

