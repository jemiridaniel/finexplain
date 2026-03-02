from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import transactions, health

app = FastAPI(
    title="FinExplain API",
    description="Explainable AI for Financial Fraud Detection",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Lock this down before production deployment
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(transactions.router, prefix="/api/v1", tags=["Transactions"])

@app.get("/")
def root():
    return {"message": "FinExplain API is running", "docs": "/docs"}