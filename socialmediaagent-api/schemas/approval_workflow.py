from pydantic import BaseModel, ConfigDict


class ApprovalWorkflowUpdate(BaseModel):
    mode: str
    reviewer_user_ids: list[str] | None = None


class ApprovalWorkflowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    mode: str
    reviewer_user_ids: list[str] | None = None
