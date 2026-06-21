"""Alert threshold endpoints — get and set per-user price alert threshold."""

# Standard library imports
from datetime import datetime

# 3rd party imports
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

# local party imports
from app.database import get_session
from app.models.user import User
from app.services.auth_service import get_current_user

router = APIRouter()


class AlertThresholdResponse(BaseModel):
    """Response shape for alert threshold queries."""

    threshold: float | None
    last_alert_sent_at: datetime | None


class AlertThresholdUpdate(BaseModel):
    """Request body for setting or clearing the alert threshold."""

    threshold: float | None


@router.get("/threshold", response_model=AlertThresholdResponse)
async def get_threshold(current_user: User = Depends(get_current_user)) -> AlertThresholdResponse:
    """Return the current user's price alert threshold and last notification time."""
    return AlertThresholdResponse(
        threshold=current_user.price_alert_threshold,
        last_alert_sent_at=current_user.last_alert_sent_at,
    )


@router.put("/threshold", response_model=AlertThresholdResponse)
async def set_threshold(
    body: AlertThresholdUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> AlertThresholdResponse:
    """Set or clear the price alert threshold.

    Pass threshold: null to disable alerts.
    Resets last_alert_sent_at so the next loop tick can fire immediately
    if the new threshold is already breached.
    """
    current_user.price_alert_threshold = body.threshold
    current_user.last_alert_sent_at = None
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return AlertThresholdResponse(
        threshold=current_user.price_alert_threshold,
        last_alert_sent_at=current_user.last_alert_sent_at,
    )
