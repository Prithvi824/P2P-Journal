"""DepositPhase model — tracks depositing crypto into Binance and converting to USDT."""

# 3rd party imports
from sqlalchemy import Float, String
from sqlalchemy.orm import Mapped, mapped_column

# local party imports
from app.models.base import TimestampedModel


class DepositPhase(TimestampedModel):
    """Records the deposit of purchased coins into Binance and their conversion to USDT."""

    __tablename__ = "deposit_phases"

    # User-supplied fields
    source_platform: Mapped[str | None] = mapped_column(String(100), nullable=True)
    coin_symbol: Mapped[str | None] = mapped_column(String(20), nullable=True)
    network: Mapped[str | None] = mapped_column(String(30), nullable=True)
    coins_deposited: Mapped[float | None] = mapped_column(Float, nullable=True)
    usdt_received: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="not_started")

    # Computed fields — set by service layer before save
    cost_per_usdt_inr: Mapped[float | None] = mapped_column(Float, nullable=True)
