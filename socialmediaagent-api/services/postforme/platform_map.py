"""Map local PlatformType values to Post for Me API platform strings."""

from models.platform_connections import PlatformType

LOCAL_TO_PFM: dict[PlatformType, str] = {
    PlatformType.linkedin: "linkedin",
    PlatformType.twitter: "x",
    PlatformType.instagram: "instagram",
    PlatformType.facebook: "facebook",
}

PFM_TO_LOCAL: dict[str, PlatformType] = {v: k for k, v in LOCAL_TO_PFM.items()}


def to_pfm_platform(platform: PlatformType) -> str:
    return LOCAL_TO_PFM[platform]


def from_pfm_platform(pfm: str) -> PlatformType | None:
    return PFM_TO_LOCAL.get(pfm.lower())


def local_platform_slug_from_pfm_name(name: str) -> str:
    """Post for Me uses `x` for X/Twitter; our slug is `twitter`."""
    n = (name or "").strip().lower()
    if n == "x":
        return PlatformType.twitter.value
    return n
