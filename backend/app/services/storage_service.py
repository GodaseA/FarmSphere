import os
import uuid
from pathlib import Path
from fastapi import UploadFile

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


async def save_image_file(file: UploadFile) -> str:
    """
    Saves uploaded file to local disk or Cloudinary.
    Returns accessible public/local URL.
    """
    contents = await file.read()
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = UPLOAD_DIR / filename

    with open(filepath, "wb") as f:
        f.write(contents)

    return f"/uploads/{filename}"


def save_image_bytes(contents: bytes, filename: str = "leaf.jpg") -> str:
    unique_name = f"{uuid.uuid4()}_{filename}"
    filepath = UPLOAD_DIR / unique_name
    with open(filepath, "wb") as f:
        f.write(contents)
    return f"/uploads/{unique_name}"
