from pydantic import BaseModel, ConfigDict


class BrandVoiceCreate(BaseModel):
    tone: str


class BrandVoiceUpdate(BaseModel):
    tone: str | None = None


class BrandVoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    tone: str
