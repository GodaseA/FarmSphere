import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "AgriConnect"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite+aiosqlite:///./agriconnect.db"
    )
    
    # Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_jwt_key_agriconnect_2026_change_in_prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_MINUTES: int = 15
    REFRESH_TOKEN_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    # ML & Services
    MODEL_VERSION: str = "v1.0"
    DISEASE_CONFIDENCE_THRESHOLD: float = 0.60
    
    # Payments & Storage
    CLOUDINARY_URL: str = os.getenv("CLOUDINARY_URL", "")
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_agriconnect_sample")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "dummy_razorpay_secret")

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
