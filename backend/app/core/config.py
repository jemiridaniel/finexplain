from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # LLM
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    ANTHROPIC_MODEL: str = "claude-haiku-4-5-20251001"
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Model
    MODEL_PATH: str = "app/models/isolation_forest.pkl"
    ANOMALY_THRESHOLD: float = -0.5

    # App
    APP_ENV: str = "development"
    CORS_ORIGINS: str = "http://localhost:3001"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()