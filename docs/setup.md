# BrightSUM Development Setup

Quick setup guide for the BrightSUM adaptive learning platform.

## Tech Stack

**Backend:**
- Python 3.10+ with FastAPI
- uvicorn (ASGI server)
- SQLModel (database ORM)
- scikit-learn (ML/adaptivity)

**Frontend:**
- React 18 (Vite)
- React Router
- Tailwind CSS v4

---

## Prerequisites

Install these before starting:
- **Git**
- **Python 3.10+** (3.11 or 3.12 recommended)
- **Node.js LTS** (includes npm)
- **VS Code** (recommended editor)

---

## Quick Start

### 1. Backend Setup (FastAPI)

```cmd
cd src\apps\api

rem Create virtual environment (one-time)
python -m venv .venv

rem Install dependencies
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\python.exe -m pip install -r requirements.txt

rem Copy environment file (one-time)
copy .env.example .env

rem Run the API server
.venv\Scripts\python.exe -m uvicorn brightsum_api.main:app --reload
```

API will run at: **http://localhost:8000**
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/health

### 2. Frontend Setup (React + Vite + Tailwind)

```cmd
cd src\apps\web

rem Install dependencies (one-time)
npm install

rem Start dev server
npm run dev
```

App will run at: **http://localhost:5173**

---

## Common Issues

### PowerShell Script Execution Blocked

If you see ""running scripts is disabled"", use **Command Prompt (cmd)** instead of PowerShell.

### Port Already in Use

- Backend: Change port with `--port 8001`
- Frontend: Vite will auto-increment to 5174, 5175, etc.

---

## Project Structure

```
BrightSUM/
 src/apps/
    api/              # FastAPI backend
       brightsum_api/
           main.py   # API entry point
           models.py # Database models
           db.py     # Database config
           ml/       # ML/adaptivity routes
    web/              # React frontend
        src/
            App.tsx
            pages/    # Page components
            components/
 requirements.txt      # Python dependencies
 docs/                 # Documentation
```

---

## Development Workflow

1. **Start backend** (Terminal 1)
2. **Start frontend** (Terminal 2)
3. **Code** - Both have hot reload
4. **Test API** - http://localhost:8000/docs

---

_Updated: November 1, 2025_
