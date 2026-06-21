"""Pydantic schemas for SaleOrder and SalePhase CRUD operations."""

# Standard library imports
import uuid
from datetime import datetime

# 3rd party imports
from pydantic import BaseModel, field_validator

# local party imports
from app.constants import PAYMENT_METHODS, PHASE_STATUSES


class SaleOrderCreate(BaseModel):
    """Fields required to add a new sale order to a SalePhase."""

    price_per_usdt: float
    usdt_sold: float
    inr_received: float
    buyer_username: str | None = None


class SaleOrderRead(BaseModel):
    """Full SaleOrder representation returned in API responses."""

    id: uuid.UUID
    price_per_usdt: float | None
    usdt_sold: float | None
    inr_received: float | None
    buyer_username: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SalePhaseUpdate(BaseModel):
    """Partial update payload for a SalePhase — all fields optional."""

    min_order_inr: float | None = None
    max_order_inr: float | None = None
    usdt_for_sale: float | None = None
    payment_methods: list[str] | None = None
    sale_fees_inr: float | None = None
    status: str | None = None
    add_orders: list[SaleOrderCreate] | None = None
    delete_order_ids: list[uuid.UUID] | None = None

    @field_validator("payment_methods")
    @classmethod
    def validate_payment_methods(cls, v: list[str] | None) -> list[str] | None:
        """Reject payment methods not in the controlled list."""
        if v is not None:
            invalid = [m for m in v if m not in PAYMENT_METHODS]
            if invalid:
                raise ValueError(f"Invalid payment methods: {invalid}. Must be from {PAYMENT_METHODS}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        """Reject unknown status values."""
        if v is not None and v not in PHASE_STATUSES:
            raise ValueError(f"status must be one of {PHASE_STATUSES}")
        return v


class SalePhaseRead(BaseModel):
    """Full SalePhase representation with nested orders."""

    id: uuid.UUID
    min_order_inr: float | None
    max_order_inr: float | None
    usdt_for_sale: float | None
    payment_methods: list[str] | None
    sale_fees_inr: float | None
    avg_price_per_usdt: float | None
    total_usdt_sold: float | None
    total_inr_received: float | None
    status: str
    orders: list[SaleOrderRead] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
