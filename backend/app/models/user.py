"""User model for authentication and price alert configuration."""

# Standard library imports
from datetime import datetime

# 3rd party imports
from sqlalchemy import Boolean, DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column

# local party imports
from app.models.base import TimestampedModel


class User(TimestampedModel):
    """Stores application users. Registration is done via seed script only."""

    __tablename__ = "users"

    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    hashed_password: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Price alert — None means alerts are disabled for this user
    price_alert_threshold: Mapped[float | None] = mapped_column(Float, nullable=True, default=None)
    last_alert_sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None
    )
