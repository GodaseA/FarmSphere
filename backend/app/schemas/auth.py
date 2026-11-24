from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Any
from datetime import datetime


class LoginRequest(BaseModel):
    username: str = Field(..., description="Email or phone number")
    password: str = Field(..., min_length=6)

    @field_validator("username", mode="before")
    @classmethod
    def clean_username(cls, v: Any) -> Any:
        if isinstance(v, str):
            return v.strip()
        return v


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class FarmerRegisterRequest(BaseModel):
    full_name: str
    phone: str
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=6)
    farm_name: Optional[str] = None
    village: Optional[str] = None
    district: str
    state: str
    pincode: Optional[str] = None
    land_size_acres: float = Field(..., gt=0)
    id_proof_url: str = "https://images.unsplash.com/photo-1544717305-2782549b5136"  # Demo proof default or uploaded

    @field_validator("email", mode="before")
    @classmethod
    def clean_email(cls, v: Any) -> Any:
        if v is None or (isinstance(v, str) and not v.strip()):
            return None
        return v.strip().lower()

    @field_validator("phone", "full_name", mode="before")
    @classmethod
    def clean_strings(cls, v: Any) -> Any:
        if isinstance(v, str):
            return v.strip()
        return v


class CustomerRegisterRequest(BaseModel):
    full_name: str
    phone: str
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=6)
    address_line: str
    city: str
    district: Optional[str] = None
    state: str
    pincode: str

    @field_validator("email", mode="before")
    @classmethod
    def clean_email(cls, v: Any) -> Any:
        if v is None or (isinstance(v, str) and not v.strip()):
            return None
        return v.strip().lower()

    @field_validator("phone", "full_name", mode="before")
    @classmethod
    def clean_strings(cls, v: Any) -> Any:
        if isinstance(v, str):
            return v.strip()
        return v



class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Any
