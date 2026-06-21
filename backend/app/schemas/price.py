"""Pydantic schemas for price and Binance ad endpoints."""

# Standard library imports
from datetime import datetime

# 3rd party imports
from pydantic import BaseModel


class PricePoint(BaseModel):
    """A single price observation from the Diamond contract on Base chain."""

    timestamp: datetime
    buy_price: float
    sell_price: float


class BinanceAd(BaseModel):
    """A single P2P advertisement from Binance with user-friendly field names."""

    seller_name: str
    price_per_usdt: float
    available_usdt: float
    min_order_inr: float
    max_order_inr: float
    payment_methods: list[str]
    monthly_orders: int


class BinanceAdsResponse(BaseModel):
    """Response wrapper for the Binance P2P ads endpoint."""

    ads: list[BinanceAd]
    total: int
