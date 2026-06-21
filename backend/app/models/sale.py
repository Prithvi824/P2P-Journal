"""SaleOrder and SalePhase models — track individual P2P sell orders and the overall sale."""

# Standard library imports
import uuid

# 3rd party imports
from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

# local party imports
from app.models.base import TimestampedModel


class SaleOrder(TimestampedModel):
    """A single fulfilled P2P sell order within a SalePhase."""

    __tablename__ = "sale_orders"

    sale_phase_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("sale_phases.id"), index=True
    )

    # User-supplied fields
    price_per_usdt: Mapped[float | None] = mapped_column(Float, nullable=True)
    usdt_sold: Mapped[float | None] = mapped_column(Float, nullable=True)
    inr_received: Mapped[float | None] = mapped_column(Float, nullable=True)
    buyer_username: Mapped[str | None] = mapped_column(String(100), nullable=True)

    sale_phase: Mapped["SalePhase"] = relationship(back_populates="orders")


class SalePhase(TimestampedModel):
    """Tracks all P2P sale orders and aggregated stats for a single trade cycle."""

    __tablename__ = "sale_phases"

    # User-supplied fields
    min_order_inr: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_order_inr: Mapped[float | None] = mapped_column(Float, nullable=True)
    usdt_for_sale: Mapped[float | None] = mapped_column(Float, nullable=True)
    payment_methods: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    sale_fees_inr: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="not_started")

    # Computed fields — set by service layer before save
    avg_price_per_usdt: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_usdt_sold: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_inr_received: Mapped[float | None] = mapped_column(Float, nullable=True)

    # selectin: loads all orders in one IN-query; cascade means deleting a SalePhase
    # automatically deletes all its child orders.
    orders: Mapped[list["SaleOrder"]] = relationship(
        back_populates="sale_phase", lazy="selectin", cascade="all, delete-orphan",
    )
