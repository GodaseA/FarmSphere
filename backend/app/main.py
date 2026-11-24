import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
import logging

from app.core.config import settings
from app.api.v1.router import api_v1_router
from app.db.session import engine
from app.db.base import Base
from app.ml.predictor import DiseaseModelManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agriconnect")

# Ensure uploads directory exists
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup:
    logger.info("Initializing database schema if not present...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Pre-loading ML model / inference manager...")
    DiseaseModelManager.get_instance()
    logger.info("AgriConnect Backend ready.")

    yield

    # Shutdown:
    logger.info("Shutting down database engine...")
    await engine.dispose()


app = FastAPI(
    title="AgriConnect API",
    description="Direct Farm-to-Customer Marketplace & Plant Disease Diagnostic REST API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Health Check (NFR-06, Sec 6.5)
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "ok",
        "service": "AgriConnect API",
        "version": settings.MODEL_VERSION,
        "database": "connected"
    }


# Standardized validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_msg = errors[0].get("msg") if errors else "Validation failed"
    first_loc = " -> ".join(str(l) for l in errors[0].get("loc", [])) if errors else ""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": f"{first_msg} at {first_loc}",
            "code": "VALIDATION_ERROR",
            "errors": errors
        }
    )


# Standardized generic exception handler
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error occurred",
            "code": "INTERNAL_ERROR"
        }
    )


# Include API v1 routes
app.include_router(api_v1_router, prefix=settings.API_V1_STR)
