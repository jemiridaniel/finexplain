from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # LLM
    GROQ_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GROQ_MODEL: str = "llama3-8b-8192"
    ANTHROPIC_MODEL: str = "claude-haiku-4-5-20251001"
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Model
    MODEL_PATH: str = "app/models/isolation_forest.pkl"
    ANOMALY_THRESHOLD: float = -0.1

    # App
    APP_ENV: str = "development"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://10.0.0.219:3001"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()