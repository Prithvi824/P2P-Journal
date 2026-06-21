"""Pydantic schemas for BuyingPhase CRUD operations."""

# Standard library imports
import uuid
from datetime import datetime

# 3rd party imports
from pydantic import BaseModel, field_validator

# local party imports
from app.constants import PHASE_STATUSES


class BuyingPhaseUpdate(BaseModel):
    """Partial update payload for a BuyingPhase — all fields optional."""

    platform: str | None = None
    price_per_coin: float | None = None
    coins_received: float | None = None
    inr_spent: float | None = None
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        """Reject unknown status values."""
        if v is not None and v not in PHASE_STATUSES:
            raise ValueError(f"status must be one of {PHASE_STATUSES}")
        return v


class BuyingPhaseRead(BaseModel):
    """Full BuyingPhase representation returned in API responses."""

    id: uuid.UUID
    platform: str | None
    price_per_coin: float | None
    coins_received: float | None
    inr_spent: float | None
    coin_value_inr: float | None
    purchase_fees_inr: float | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
