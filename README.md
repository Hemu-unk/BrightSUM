# BrightSUM

BrightSUM is a web application for creating, delivering, and analyzing question sets for classroom use. It provides teacher tools to import question sets, deliver quizzes to students, and uses ML pipelines to generate hints and evaluate answer correctness. The repo contains a Django backend (API + ML pipelines) and a React frontend.

Short features
- Import/export question sets (CSV)
- Teacher dashboard to create and manage quizzes
- Student UI for taking quizzes and receiving hints
- ML-based hint and correctness evaluation modules (see ML docs)

Quick start (automated, Windows)
1. Open a repository shell at the project root.
2. Run the provided setup script:
   - setup.cmd
3. Start development servers (runs backend + frontend):
   - start-dev.cmd

Quick start (manual)
1. Backend
   - Create and activate a Python virtual environment:
     - python -m venv .venv
     - .venv\Scripts\activate (Windows) or source .venv/bin/activate (macOS/Linux)
   - Install Python dependencies:
     - pip install -r requirements.txt
   - Apply database migrations:
     - python manage.py migrate
   - Create a superuser (optional, for admin access):
     - python manage.py createsuperuser
   - Start the Django dev server:
     - python manage.py runserver

2. Frontend (assuming a `frontend` folder; adjust as needed)
   - cd frontend
   - npm install
   - npm start
   - The frontend typically runs at http://localhost:3000 and the backend at http://localhost:8000

Notes on libraries
- Python dependencies are listed in requirements.txt. Typical packages used include:
  - Django, djangorestframework
  - Machine learning libraries referenced in this repo (check src/apps/api/brightsum_api/ml/ML_README.md)
- Frontend uses Node packages; check package.json in the frontend folder for exact dependencies (React, axios, etc.).

Useful docs and files
- Setup & development: docs/setup.md
- Example question sets: docs/QuestionSet.CSV, docs/QuestionSet2.csv
- ML pipelines and training details: src/apps/api/brightsum_api/ml/ML_README.md
- Project planning: BrightSUM Planning (GitHub Projects)

Troubleshooting
- If dependencies fail to install, ensure Python/Node versions are compatible and your virtual environment is active.
- Use the provided scripts (setup.cmd, start-dev.cmd) on Windows to simplify environment setup.

Contact / Team
- See the repository top-level README for team and project contacts.


Where to find more information
-----------------------------

- Quickstart (Windows): from the repository root run:
  - setup.cmd
  - start-dev.cmd
  These start the backend and frontend in dev mode.

- Setup & development: docs/setup.md — step-by-step environment setup, virtualenv instructions, migrations, and how to run backend/frontend.

- Example question sets: docs/QuestionSet.CSV, docs/QuestionSet2.csv — sample CSVs for Teacher import.

- ML documentation and training: src/apps/api/brightsum_api/ml/ML_README.md — details on hint & correctness ML pipelines and the experimental IRT pipeline.

- Backend dependencies: requirements.txt
- Frontend dependencies: frontend/package.json (adjust path if your frontend folder is named differently)

- Project planning: BrightSUM Planning (GitHub Projects) — https://github.com/orgs/cis3750-f25/projects/2

- Need help: open an issue in this repo or contact the project maintainers listed at the top of this README.

