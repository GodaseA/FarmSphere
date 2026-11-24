import io
from PIL import Image
import numpy as np
from fastapi import HTTPException

# PlantVillage standard dimensions
IMAGE_SIZE = (224, 224)
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB limit


def validate_image_bytes(image_bytes: bytes) -> Image.Image:
    """
    Validates file size, image integrity, and supported format.
    Raises HTTPException if invalid.
    """
    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail={"detail": "Image file exceeds 5MB size limit", "code": "IMAGE_TOO_LARGE"}
        )

    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()  # Verify integrity
        # Reopen because verify() closes the file handle
        img = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={"detail": f"Invalid image file: {str(e)}", "code": "INVALID_IMAGE"}
        )

    if img.format not in ("JPEG", "PNG", "JPG", "WEBP"):
        raise HTTPException(
            status_code=400,
            detail={"detail": "Supported image formats are JPEG, PNG, WEBP", "code": "UNSUPPORTED_FORMAT"}
        )

    return img


def preprocess_for_inference(img: Image.Image) -> np.ndarray:
    """
    Converts image to RGB, resizes to (224, 224), and converts to float32 normalized array.
    """
    img_rgb = img.convert("RGB")
    img_resized = img_rgb.resize(IMAGE_SIZE, Image.Resampling.BILINEAR)
    img_array = np.array(img_resized, dtype=np.float32)

    # Scale pixel values [0, 255] -> [-1, 1] for MobileNetV2
    img_array = (img_array / 127.5) - 1.0

    # Expand batch dimension [1, 224, 224, 3]
    return np.expand_dims(img_array, axis=0)
