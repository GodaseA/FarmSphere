from typing import List, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.farmer_profile import FarmerProfile
from app.core.errors import UnauthorizedException, ForbiddenException

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"detail": "Token is invalid or expired", "code": "TOKEN_EXPIRED"}
        )

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Could not validate credentials", "INVALID_TOKEN")

    query = select(User).options(
        selectinload(User.farmer_profile),
        selectinload(User.customer_profile)
    ).where(User.id == user_id)
    
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise UnauthorizedException("User not found", "USER_NOT_FOUND")

    if user.status == "blocked":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"detail": "User account has been blocked by administrator", "code": "USER_BLOCKED"}
        )

    return user


def require_role(*allowed_roles: str) -> Callable:
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"detail": f"Operation requires role in {allowed_roles}", "code": "FORBIDDEN_ROLE"}
            )
        return current_user
    return role_checker


async def require_approved_farmer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"detail": "Only farmers can perform this action", "code": "FARMER_REQUIRED"}
        )
    if not current_user.farmer_profile or current_user.farmer_profile.verification_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"detail": "Farmer account is pending verification by admin", "code": "FARMER_NOT_VERIFIED"}
        )
    return current_user
