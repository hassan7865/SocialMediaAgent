from pydantic import BaseModel, ConfigDict


class BrandVoiceCreate(BaseModel):
    formality_level: int
    style: str
    persona_prompt: str
    sample_approved_posts: list[str] | None = None


class BrandVoiceUpdate(BaseModel):
    formality_level: int | None = None
    style: str | None = None
    persona_prompt: str | None = None
    sample_approved_posts: list[str] | None = None


class BrandVoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    formality_level: int
    style: str
    persona_prompt: str
    sample_approved_posts: list[str] | None = None
