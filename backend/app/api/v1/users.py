from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate
from app.services.storage_service import save_image_file

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.put("/me", response_model=UserOut)
async def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    for field, val in data.model_dump(exclude_unset=True).items():
        if hasattr(current_user, field) and val is not None:
            setattr(current_user, field, val)

    if current_user.role == "customer" and current_user.customer_profile:
        for f in ["address_line", "city", "state", "pincode", "district"]:
            v = getattr(data, f, None)
            if v is not None:
                setattr(current_user.customer_profile, f, v)

    if current_user.role == "farmer" and current_user.farmer_profile:
        for f in ["farm_name", "village", "district"]:
            v = getattr(data, f, None)
            if v is not None:
                setattr(current_user.farmer_profile, f, v)

    await db.commit()
    await db.refresh(current_user)
    return UserOut.model_validate(current_user)


@router.post("/upload/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    url = await save_image_file(file)
    current_user.avatar_url = url
    await db.commit()
    return {"status": "success", "avatar_url": url}
