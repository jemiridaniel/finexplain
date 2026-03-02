from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from app.core.config import settings
from app.api import transactions, health

app = FastAPI(
    title="FinExplain API",
    description="Explainable AI for Financial Fraud Detection",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(transactions.router, prefix="/api/v1", tags=["Transactions"])

# Serve React build — must come AFTER API routes
react_build = Path("/app/frontend/build")
if react_build.exists():
    app.mount("/static", StaticFiles(directory=str(react_build / "static")), name="static")

    @app.get("/")
    def serve_root():
        return FileResponse(str(react_build / "index.html"))

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = react_build / full_path
        if file_path.exists():
            return FileResponse(str(file_path))
        return FileResponse(str(react_build / "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "FinExplain API is running", "docs": "/docs"}