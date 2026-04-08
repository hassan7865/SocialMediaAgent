from typing import Any

from pydantic import BaseModel, ConfigDict


class Envelope(BaseModel):
    status: str
    message: str
    data: Any = None


class PaginationData(BaseModel):
    items: list[Any]
    total: int
    page: int
    pages: int


class ORMResponseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
