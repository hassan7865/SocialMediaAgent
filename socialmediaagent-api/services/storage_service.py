import io
from typing import Any

import cloudinary
import cloudinary.uploader

from core.config import get_settings


def _configure_cloudinary() -> None:
    settings = get_settings()
    if settings.CLOUDINARY_CLOUD_NAME:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
        )


async def upload_to_cloudinary(
    file_data: bytes,
    filename: str,
    resource_type: str = "image",
) -> dict[str, Any]:
    """Upload file to Cloudinary and return the result."""
    _configure_cloudinary()

    settings = get_settings()
    if not settings.CLOUDINARY_CLOUD_NAME:
        raise ValueError("Cloudinary is not configured")

    result = cloudinary.uploader.upload(
        io.BytesIO(file_data),
        public_id=f"posts/{filename}",
        resource_type=resource_type,
    )

    return {
        "url": result.get("secure_url"),
        "public_id": result.get("public_id"),
        "format": result.get("format"),
        "width": result.get("width"),
        "height": result.get("height"),
    }


async def delete_from_cloudinary(public_id: str) -> bool:
    """Delete a file from Cloudinary."""
    _configure_cloudinary()

    settings = get_settings()
    if not settings.CLOUDINARY_CLOUD_NAME:
        return False

    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception:
        return False
