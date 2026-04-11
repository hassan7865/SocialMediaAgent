"""Filesystem paths for runtime data (uploads, etc.)."""

from pathlib import Path

API_ROOT = Path(__file__).resolve().parents[1]
UPLOAD_ROOT = API_ROOT / "uploads"
POST_MEDIA_DIR = UPLOAD_ROOT / "post_media"


def ensure_upload_dirs() -> None:
    POST_MEDIA_DIR.mkdir(parents=True, exist_ok=True)
