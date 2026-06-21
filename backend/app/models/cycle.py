"""TradeCycle model — the central record tying all phases of one trade together."""

# Standard library imports
import uuid

# 3rd party imports
from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

# local party imports
from app.models.base import TimestampedModel
from app.models.buying import BuyingPhase
from app.models.deposit import DepositPhase
from app.models.sale import SalePhase


class TradeCycle(TimestampedModel):
    """Represents one complete buy → deposit → sell cycle."""

    __tablename__ = "trade_cycles"

    # Owner — every cycle belongs to exactly one user
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )

    # Foreign keys to phase tables
    buy_phase_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("buying_phases.id")
    )
    deposit_phase_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("deposit_phases.id"), nullable=True
    )
    sale_phase_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("sale_phases.id"), nullable=True
    )

    # Cycle status — derived by infer_cycle_status()
    status: Mapped[str] = mapped_column(String(20), default="buying")

    # Denormalised / computed aggregates updated on every write
    total_inr_spent: Mapped[float] = mapped_column(Float, default=0.0)
    total_inr_received: Mapped[float] = mapped_column(Float, default=0.0)
    remaining_usdt: Mapped[float] = mapped_column(Float, default=0.0)
    remaining_value_inr: Mapped[float] = mapped_column(Float, default=0.0)
    total_fees_inr: Mapped[float] = mapped_column(Float, default=0.0)
    pnl: Mapped[float] = mapped_column(Float, default=0.0)

    # Relationships — selectin avoids N+1; cascade+single_parent means deleting the
    # cycle automatically deletes its owned phases (each phase belongs to one cycle only).
    buy_phase: Mapped[BuyingPhase | None] = relationship(
        foreign_keys=[buy_phase_id], lazy="selectin",
        cascade="all, delete-orphan", single_parent=True,
    )
    deposit_phase: Mapped[DepositPhase | None] = relationship(
        foreign_keys=[deposit_phase_id], lazy="selectin",
        cascade="all, delete-orphan", single_parent=True,
    )
    sale_phase: Mapped[SalePhase | None] = relationship(
        foreign_keys=[sale_phase_id], lazy="selectin",
        cascade="all, delete-orphan", single_parent=True,
    )
