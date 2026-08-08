"""
CredAI — AI-Driven Dynamic Underwriting System
FastAPI Backend Entry Point
"""

import sys
import os

# Add parent directory to path for module resolution
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db.database import init_db
from db.seed_data import seed_database
from routes.applications import router as applications_router
from routes.admin import router as admin_router
from routes.scoring import router as scoring_router
from routes.advisor import router as advisor_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and seed data on startup."""
    print("[CredAI] Starting backend...")
    init_db()
    seed_database()
    print("[CredAI] Backend ready at http://localhost:8000")
    yield
    print("[CredAI] Shutting down...")


app = FastAPI(
    title="CredAI — AI-Driven Dynamic Underwriting API",
    description="""
    An AI-powered loan underwriting system that uses both traditional financial data
    and alternative data signals to make smarter, fairer, explainable, and continuously
    updated lending decisions while detecting fraud and protecting user privacy.
    """,
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend (Vite dev server on port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(applications_router)
app.include_router(admin_router)
app.include_router(scoring_router)
app.include_router(advisor_router)


@app.get("/")
def root():
    return {
        "name": "CredAI API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "docs": "/docs",
            "applications": "/api/applications",
            "admin": "/api/admin",
            "scoring": "/api/score",
            "advisor": "/api/advisor/chat",
        }
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "credai-backend"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
