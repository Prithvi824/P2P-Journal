"""Pydantic schemas for DepositPhase CRUD operations."""

# Standard library imports
import uuid
from datetime import datetime

# 3rd party imports
from pydantic import BaseModel, field_validator

# local party imports
from app.constants import COINS, NETWORKS, PHASE_STATUSES


class DepositPhaseUpdate(BaseModel):
    """Partial update payload for a DepositPhase — all fields optional."""

    source_platform: str | None = None
    coin_symbol: str | None = None
    network: str | None = None
    coins_deposited: float | None = None
    usdt_received: float | None = None
    status: str | None = None

    @field_validator("coin_symbol")
    @classmethod
    def validate_coin(cls, v: str | None) -> str | None:
        """Reject coin symbols not in the controlled list."""
        if v is not None and v not in COINS:
            raise ValueError(f"coin_symbol must be one of {COINS}")
        return v

    @field_validator("network")
    @classmethod
    def validate_network(cls, v: str | None) -> str | None:
        """Reject network values not in the controlled list."""
        if v is not None and v not in NETWORKS:
            raise ValueError(f"network must be one of {NETWORKS}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        """Reject unknown status values."""
        if v is not None and v not in PHASE_STATUSES:
            raise ValueError(f"status must be one of {PHASE_STATUSES}")
        return v


class DepositPhaseRead(BaseModel):
    """Full DepositPhase representation returned in API responses."""

    id: uuid.UUID
    source_platform: str | None
    coin_symbol: str | None
    network: str | None
    coins_deposited: float | None
    usdt_received: float | None
    cost_per_usdt_inr: float | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
