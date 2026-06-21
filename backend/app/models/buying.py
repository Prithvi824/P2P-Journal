"""BuyingPhase model — tracks how the user purchased crypto before depositing."""

# 3rd party imports
from sqlalchemy import Float, String
from sqlalchemy.orm import Mapped, mapped_column

# local party imports
from app.models.base import TimestampedModel


class BuyingPhase(TimestampedModel):
    """Records a single purchase of crypto coins used to seed a trade cycle."""

    __tablename__ = "buying_phases"

    # User-supplied fields
    platform: Mapped[str | None] = mapped_column(String(100), nullable=True)
    price_per_coin: Mapped[float | None] = mapped_column(Float, nullable=True)
    coins_received: Mapped[float | None] = mapped_column(Float, nullable=True)
    inr_spent: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="not_started")

    # Computed fields — set by service layer before save
    coin_value_inr: Mapped[float | None] = mapped_column(Float, nullable=True)
    purchase_fees_inr: Mapped[float | None] = mapped_column(Float, nullable=True)
