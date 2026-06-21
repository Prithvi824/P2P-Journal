"""Binance router — exposes current P2P ads with optional filtering."""

# Standard library imports
from typing import Annotated

# 3rd party imports
from fastapi import APIRouter, Depends, Query

# local party imports
from app.models.user import User
from app.schemas.price import BinanceAdsResponse
from app.services.auth_service import get_current_user
from app.services.binance_service import fetch_ads

router = APIRouter()


@router.get("/get-p2p-ads", response_model=BinanceAdsResponse)
async def get_p2p_ads(
    trade_type: Annotated[str, Query(description="BUY or SELL")] = "BUY",
    pay_types: Annotated[str | None, Query(description="Comma-separated payment methods")] = None,
    trans_amount: Annotated[int | None, Query(description="Trade amount in INR passed to Binance")] = None,
    _: User = Depends(get_current_user),
) -> BinanceAdsResponse:
    """Return filtered Binance P2P ads sorted by price."""
    parsed_pay_types = [p.strip() for p in pay_types.split(",")] if pay_types else None
    return await fetch_ads(
        trade_type=trade_type,
        pay_types=parsed_pay_types,
        trans_amount=trans_amount,
    )
