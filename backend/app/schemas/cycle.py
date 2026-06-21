"""Pydantic schemas for TradeCycle CRUD operations."""

# Standard library imports
import uuid
from datetime import datetime

# 3rd party imports
from pydantic import BaseModel

# local party imports
from app.schemas.buying import BuyingPhaseRead, BuyingPhaseUpdate
from app.schemas.deposit import DepositPhaseRead, DepositPhaseUpdate
from app.schemas.sale import SalePhaseRead, SalePhaseUpdate


class TradeCycleListItem(BaseModel):
    """Lightweight cycle summary for the dashboard cycle table."""

    id: uuid.UUID
    status: str
    pnl: float
    total_inr_spent: float
    total_inr_received: float
    remaining_usdt: float
    total_fees_inr: float
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TradeCycleRead(BaseModel):
    """Full cycle with all nested phases and orders."""

    id: uuid.UUID
    status: str
    pnl: float
    total_inr_spent: float
    total_inr_received: float
    remaining_usdt: float
    remaining_value_inr: float
    total_fees_inr: float
    buy_phase: BuyingPhaseRead | None = None
    deposit_phase: DepositPhaseRead | None = None
    sale_phase: SalePhaseRead | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TradeCycleUpdate(BaseModel):
    """Nested update payload — send only the phases you want to update."""

    buy_phase: BuyingPhaseUpdate | None = None
    deposit_phase: DepositPhaseUpdate | None = None
    sale_phase: SalePhaseUpdate | None = None
