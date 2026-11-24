from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.auth import LoginRequest, FarmerRegisterRequest, CustomerRegisterRequest, TokenResponse, RefreshTokenRequest
from app.services.auth_service import login_user, register_farmer, register_customer, refresh_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await login_user(db, data)


@router.post("/register/farmer", response_model=TokenResponse)
async def register_as_farmer(data: FarmerRegisterRequest, db: AsyncSession = Depends(get_db)):
    return await register_farmer(db, data)


@router.post("/register/customer", response_model=TokenResponse)
async def register_as_customer(data: CustomerRegisterRequest, db: AsyncSession = Depends(get_db)):
    return await register_customer(db, data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    return await refresh_access_token(db, data.refresh_token)


@router.post("/logout")
async def logout():
    return {"status": "success", "message": "Logged out successfully"}
