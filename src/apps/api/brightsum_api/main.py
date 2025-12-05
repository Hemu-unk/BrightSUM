import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import init_db   # DB init (creates tables if missing)
from .ml import adapt # Import ML routes
from .routers import ml_debug, practice, quiz, practice_v2
from .routers import teacher, review

# Load environment from .env in the API folder when running via start-dev
load_dotenv()

# Import auth after loading env so services read env vars correctly
from . import auth    # auth router

app = FastAPI(
    title="BrightSUM API",
    description="Backend API for BrightSUM adaptive learning platform",
    version="0.1.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Vite dev server, and extra port just in case
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup (creates tables if missing, keeps data)
@app.on_event("startup")
def _startup():
    init_db()

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "BrightSUM API is running",
        "version": "0.1.0",
        "frontend_url": "http://localhost:5173",
        "docs_url": "http://localhost:8000/docs",
        "endpoints": {
            "health": "/api/health",
            "ml_adaptivity": "/api/ml/adapt"
        }
    }

@app.get("/api/health")
def health_check():
    """API health check"""
    return {
        "status": "healthy",
        "version": "0.1.0",
        "message": "Backend API is operational"
    }

# ML routes
app.include_router(adapt.router, prefix="/api/ml", tags=["ml"])
app.include_router(ml_debug.router, prefix="/api/ml", tags=["ml"])

#Practice routes
app.include_router(practice.router, prefix="/api/practice/debug", tags=["practice-debug"])

#quiz and practice v2 routes
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(practice_v2.router, prefix="/api/practice", tags=["practice"])

# auth routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Teacher route
app.include_router(teacher.router, prefix="/api/teacher", tags=["teacher"])
app.include_router(review.router, prefix="/api/review", tags=["review"]) 
