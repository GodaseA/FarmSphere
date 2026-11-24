from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
import uuid

from app.models.user import User
from app.models.farmer_profile import FarmerProfile
from app.models.customer_profile import CustomerProfile
from app.models.cart import Cart
from app.core.security import verify_password, hash_password, create_access_token, create_refresh_token, decode_token
from app.schemas.auth import LoginRequest, FarmerRegisterRequest, CustomerRegisterRequest, TokenResponse
from app.schemas.user import UserOut


async def login_user(db: AsyncSession, data: LoginRequest) -> TokenResponse:
    clean_username = data.username.strip() if data.username else ""
    clean_username_lower = clean_username.lower()

    query = select(User).options(
        selectinload(User.farmer_profile),
        selectinload(User.customer_profile)
    ).where(
        or_(
            func.lower(User.email) == clean_username_lower,
            User.phone == clean_username
        )
    )
    result = await db.execute(query)
    user = result.scalar_one_or_none()


    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"detail": "Invalid email/phone or password", "code": "INVALID_CREDENTIALS"}
        )

    if user.status == "blocked":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"detail": "Your account has been blocked by administrator", "code": "ACCOUNT_BLOCKED"}
        )

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id, user.role)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user)
    )


async def register_farmer(db: AsyncSession, data: FarmerRegisterRequest) -> TokenResponse:
    clean_phone = data.phone.strip()
    clean_email = data.email.strip().lower() if data.email else None

    # Check duplicate phone or email
    if clean_email:
        check_query = select(User).where(or_(User.phone == clean_phone, func.lower(User.email) == clean_email))
    else:
        check_query = select(User).where(User.phone == clean_phone)
    existing = (await db.execute(check_query)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"detail": "User with this phone or email already exists", "code": "USER_EXISTS"}
        )

    user = User(
        full_name=data.full_name.strip(),
        email=clean_email,
        phone=clean_phone,
        password_hash=hash_password(data.password),
        role="farmer",
        status="active"
    )
    db.add(user)
    await db.flush()

    farmer_profile = FarmerProfile(
        user_id=user.id,
        farm_name=data.farm_name or f"{data.full_name}'s Farm",
        village=data.village,
        district=data.district,
        state=data.state,
        pincode=data.pincode,
        land_size_acres=data.land_size_acres,
        id_proof_url=data.id_proof_url,
        verification_status="pending"  # Farmer starts as pending per FR-02
    )
    db.add(farmer_profile)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id, user.role)

    # Reload with relations
    query = select(User).options(
        selectinload(User.farmer_profile),
        selectinload(User.customer_profile)
    ).where(User.id == user.id)
    user_with_profile = (await db.execute(query)).scalar_one()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user_with_profile)
    )


async def register_customer(db: AsyncSession, data: CustomerRegisterRequest) -> TokenResponse:
    clean_phone = data.phone.strip()
    clean_email = data.email.strip().lower() if data.email else None

    if clean_email:
        check_query = select(User).where(or_(User.phone == clean_phone, func.lower(User.email) == clean_email))
    else:
        check_query = select(User).where(User.phone == clean_phone)
    existing = (await db.execute(check_query)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"detail": "User with this phone or email already exists", "code": "USER_EXISTS"}
        )

    user = User(
        full_name=data.full_name.strip(),
        email=clean_email,
        phone=clean_phone,
        password_hash=hash_password(data.password),
        role="customer",
        status="active"
    )
    db.add(user)
    await db.flush()

    customer_profile = CustomerProfile(
        user_id=user.id,
        address_line=data.address_line,

        city=data.city,
        district=data.district,
        state=data.state,
        pincode=data.pincode
    )
    db.add(customer_profile)
    
    # Pre-create empty server-side cart
    cart = Cart(customer_id=user.id)
    db.add(cart)

    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id, user.role)

    query = select(User).options(
        selectinload(User.farmer_profile),
        selectinload(User.customer_profile)
    ).where(User.id == user.id)
    user_with_profile = (await db.execute(query)).scalar_one()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user_with_profile)
    )


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> TokenResponse:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"detail": "Refresh token is invalid or expired", "code": "TOKEN_EXPIRED"}
        )

    user_id = payload.get("sub")
    query = select(User).options(
        selectinload(User.farmer_profile),
        selectinload(User.customer_profile)
    ).where(User.id == user_id)
    user = (await db.execute(query)).scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "User not found", "code": "NOT_FOUND"}
        )

    new_access_token = create_access_token(user.id, user.role)
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user)
    )
