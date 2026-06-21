"""Journal service — CRUD operations for TradeCycle and all nested phases.

All computed fields are recalculated bottom-up (order → SalePhase → TradeCycle)
on every write so the DB always stores current, consistent values.
"""

# Standard library imports
import uuid
from datetime import UTC, datetime

# 3rd party imports
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# local party imports
from app.models.buying import BuyingPhase
from app.models.cycle import TradeCycle
from app.models.deposit import DepositPhase
from app.models.sale import SaleOrder, SalePhase
from app.schemas.cycle import TradeCycleListItem, TradeCycleRead, TradeCycleUpdate
from app.services.computed_fields import (
    compute_avg_price_per_usdt,
    compute_coin_value_inr,
    compute_cost_per_usdt,
    compute_pnl,
    compute_purchase_fees,
    compute_remaining_usdt,
    compute_remaining_value_inr,
    compute_total_fees,
    compute_total_inr_received,
    compute_total_usdt_sold,
    infer_cycle_status,
)


async def _get_cycle_or_404(session: AsyncSession, cycle_id: uuid.UUID) -> TradeCycle:
    """Fetch a TradeCycle by id, raising 404 if not found."""
    result = (
        await session.execute(select(TradeCycle).where(TradeCycle.id == cycle_id))
    ).scalars()
    cycle = result.first()
    if cycle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cycle not found"
        )
    return cycle


async def _get_sale_orders(
    session: AsyncSession, sale_phase_id: uuid.UUID
) -> list[SaleOrder]:
    """Return all SaleOrders belonging to a given SalePhase."""
    result = (
        await session.execute(
            select(SaleOrder).where(SaleOrder.sale_phase_id == sale_phase_id)
        )
    ).scalars()
    return list(result.all())


def _check_immutable(cycle: TradeCycle) -> None:
    """Raise 403 if the cycle is completed and therefore immutable."""
    if cycle.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Completed cycles are immutable",
        )


async def _recompute_sale_phase(session: AsyncSession, sale_phase: SalePhase) -> None:
    """Recompute all aggregated fields on a SalePhase from its current orders."""
    orders = await _get_sale_orders(session, sale_phase.id)
    sale_phase.total_usdt_sold = compute_total_usdt_sold(orders)
    sale_phase.total_inr_received = compute_total_inr_received(orders)
    sale_phase.avg_price_per_usdt = compute_avg_price_per_usdt(orders)
    sale_phase.updated_at = datetime.now(UTC)
    session.add(sale_phase)


async def _recompute_cycle(
    session: AsyncSession,
    cycle: TradeCycle,
    buy: BuyingPhase,
    deposit: DepositPhase | None,
    sale: SalePhase | None,
) -> None:
    """Recompute all TradeCycle-level aggregated fields from the current phase state."""
    orders: list[SaleOrder] = []
    if sale is not None:
        orders = await _get_sale_orders(session, sale.id)

    cycle.total_inr_spent = buy.inr_spent or 0.0
    cycle.total_inr_received = compute_total_inr_received(orders)

    avg_price = compute_avg_price_per_usdt(orders)
    usdt_for_sale = (sale.usdt_for_sale or 0.0) if sale else 0.0
    total_usdt_sold = compute_total_usdt_sold(orders)

    cycle.remaining_usdt = compute_remaining_usdt(usdt_for_sale, total_usdt_sold)
    cycle.remaining_value_inr = compute_remaining_value_inr(
        avg_price, cycle.remaining_usdt
    )
    cycle.pnl = compute_pnl(
        cycle.total_inr_spent, cycle.total_inr_received, avg_price, cycle.remaining_usdt
    )
    cycle.total_fees_inr = compute_total_fees(
        buy.purchase_fees_inr if buy.purchase_fees_inr is not None else 0.0,
        sale.sale_fees_inr if sale is not None and sale.sale_fees_inr is not None else 0.0,
    )
    cycle.status = infer_cycle_status(buy, deposit, sale, cycle.remaining_usdt)
    cycle.updated_at = datetime.now(UTC)
    session.add(cycle)


async def get_all_cycles(session: AsyncSession) -> list[TradeCycleListItem]:
    """Return lightweight summaries of all trade cycles for the dashboard."""
    result = (
        await session.execute(select(TradeCycle).order_by(TradeCycle.created_at.desc()))
    ).scalars()
    cycles = result.all()
    return [TradeCycleListItem.model_validate(c) for c in cycles]


async def get_cycle_by_id(session: AsyncSession, cycle_id: uuid.UUID) -> TradeCycleRead:
    """Return the full TradeCycle with nested phases and orders."""
    cycle = await _get_cycle_or_404(session, cycle_id)

    buy = None
    deposit = None
    sale = None

    if cycle.buy_phase_id:
        buy = (
            (
                await session.execute(
                    select(BuyingPhase).where(BuyingPhase.id == cycle.buy_phase_id)
                )
            )
            .scalars()
            .first()
        )

    if cycle.deposit_phase_id:
        deposit = (
            (
                await session.execute(
                    select(DepositPhase).where(
                        DepositPhase.id == cycle.deposit_phase_id
                    )
                )
            )
            .scalars()
            .first()
        )

    if cycle.sale_phase_id:
        sale = (
            (
                await session.execute(
                    select(SalePhase).where(SalePhase.id == cycle.sale_phase_id)
                )
            )
            .scalars()
            .first()
        )

    orders: list[SaleOrder] = []
    if sale:
        orders = await _get_sale_orders(session, sale.id)

    sale_read = None
    if sale:
        from app.schemas.sale import SaleOrderRead, SalePhaseRead

        sale_read = SalePhaseRead.model_validate(sale)
        sale_read.orders = [SaleOrderRead.model_validate(o) for o in orders]

    from app.schemas.buying import BuyingPhaseRead
    from app.schemas.cycle import TradeCycleRead
    from app.schemas.deposit import DepositPhaseRead

    return TradeCycleRead(
        id=cycle.id,
        status=cycle.status,
        pnl=cycle.pnl,
        total_inr_spent=cycle.total_inr_spent,
        total_inr_received=cycle.total_inr_received,
        remaining_usdt=cycle.remaining_usdt,
        remaining_value_inr=cycle.remaining_value_inr,
        total_fees_inr=cycle.total_fees_inr,
        created_at=cycle.created_at,
        updated_at=cycle.updated_at,
        buy_phase=BuyingPhaseRead.model_validate(buy) if buy else None,
        deposit_phase=DepositPhaseRead.model_validate(deposit) if deposit else None,
        sale_phase=sale_read,
    )


async def create_cycle(session: AsyncSession) -> TradeCycleRead:
    """Create a new TradeCycle with an empty BuyingPhase shell."""
    buy_phase = BuyingPhase()
    session.add(buy_phase)
    await session.flush()

    cycle = TradeCycle(buy_phase_id=buy_phase.id)
    session.add(cycle)
    await session.commit()
    await session.refresh(cycle)
    await session.refresh(buy_phase)

    return await get_cycle_by_id(session, cycle.id)


async def update_cycle(
    session: AsyncSession,
    cycle_id: uuid.UUID,
    payload: TradeCycleUpdate,
) -> TradeCycleRead:
    """Apply partial updates to a cycle and its phases, recomputing all derived fields."""
    cycle = await _get_cycle_or_404(session, cycle_id)
    _check_immutable(cycle)

    buy = (
        (
            await session.execute(
                select(BuyingPhase).where(BuyingPhase.id == cycle.buy_phase_id)
            )
        )
        .scalars()
        .first()
    )

    deposit = None
    if cycle.deposit_phase_id:
        deposit = (
            (
                await session.execute(
                    select(DepositPhase).where(
                        DepositPhase.id == cycle.deposit_phase_id
                    )
                )
            )
            .scalars()
            .first()
        )

    sale = None
    if cycle.sale_phase_id:
        sale = (
            (
                await session.execute(
                    select(SalePhase).where(SalePhase.id == cycle.sale_phase_id)
                )
            )
            .scalars()
            .first()
        )

    # --- BuyingPhase update ---
    if payload.buy_phase is not None and buy is not None:
        buy_update = payload.buy_phase
        if buy_update.status == "completed":
            effective_platform = buy_update.platform or buy.platform
            effective_price = buy_update.price_per_coin or buy.price_per_coin
            effective_coins = buy_update.coins_received or buy.coins_received
            effective_inr = buy_update.inr_spent or buy.inr_spent
            if not all(
                [effective_platform, effective_price, effective_coins, effective_inr]
            ):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Cannot mark buying phase complete: all fields (platform, price_per_coin, coins_received, inr_spent) must be filled",
                )
        for field, value in buy_update.model_dump(exclude_unset=True).items():
            setattr(buy, field, value)
        if buy.price_per_coin is not None and buy.coins_received is not None:
            buy.coin_value_inr = compute_coin_value_inr(
                buy.price_per_coin, buy.coins_received
            )
        if buy.inr_spent is not None and buy.coin_value_inr is not None:
            buy.purchase_fees_inr = compute_purchase_fees(
                buy.inr_spent, buy.coin_value_inr
            )
        buy.updated_at = datetime.now(UTC)
        session.add(buy)

    # --- DepositPhase update ---
    if payload.deposit_phase is not None:
        if deposit is None:
            deposit = DepositPhase()
            session.add(deposit)
            await session.flush()
            cycle.deposit_phase_id = deposit.id

        deposit_update = payload.deposit_phase
        if deposit_update.status == "completed":
            completion_fields = {
                "source_platform": deposit_update.source_platform or deposit.source_platform,
                "coin_symbol": deposit_update.coin_symbol or deposit.coin_symbol,
                "network": deposit_update.network or deposit.network,
                "coins_deposited": deposit_update.coins_deposited or deposit.coins_deposited,
                "usdt_received": deposit_update.usdt_received or deposit.usdt_received,
            }
            if not all(completion_fields.values()):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Cannot mark deposit phase complete: all fields must be filled",
                )
        for field, value in deposit_update.model_dump(exclude_unset=True).items():
            setattr(deposit, field, value)
        total_inr = buy.inr_spent if buy else 0.0
        if total_inr and deposit.usdt_received:
            deposit.cost_per_usdt_inr = compute_cost_per_usdt(
                total_inr, deposit.usdt_received
            )
        deposit.updated_at = datetime.now(UTC)
        session.add(deposit)

    # --- SalePhase update ---
    if payload.sale_phase is not None:
        if sale is None:
            sale = SalePhase()
            session.add(sale)
            await session.flush()
            cycle.sale_phase_id = sale.id

        sale_update = payload.sale_phase

        if sale_update.delete_order_ids:
            for order_id in sale_update.delete_order_ids:
                order = (
                    (
                        await session.execute(
                            select(SaleOrder).where(SaleOrder.id == order_id)
                        )
                    )
                    .scalars()
                    .first()
                )
                if order and order.sale_phase_id == sale.id:
                    session.delete(order)

        if sale_update.add_orders:
            for order_data in sale_update.add_orders:
                new_order = SaleOrder(
                    sale_phase_id=sale.id,
                    price_per_usdt=order_data.price_per_usdt,
                    usdt_sold=order_data.usdt_sold,
                    inr_received=order_data.inr_received,
                    buyer_username=order_data.buyer_username,
                )
                session.add(new_order)

        # Flush so order inserts/deletes reach the DB, then drop the stale orders
        # cache from the identity map so _recompute_sale_phase re-queries the updated set.
        # Only the relationship is expired — column attributes stay intact to avoid
        # triggering a lazy-load (which raises MissingGreenlet in async context).
        await session.flush()
        session.expire(sale, ["orders"])

        if sale_update.status == "completed":
            completion_fields = {
                "min_order_inr": (
                    sale_update.min_order_inr
                    if sale_update.min_order_inr is not None
                    else sale.min_order_inr
                ),
                "max_order_inr": (
                    sale_update.max_order_inr
                    if sale_update.max_order_inr is not None
                    else sale.max_order_inr
                ),
                "usdt_for_sale": (
                    sale_update.usdt_for_sale
                    if sale_update.usdt_for_sale is not None
                    else sale.usdt_for_sale
                ),
                "sale_fees_inr": (
                    sale_update.sale_fees_inr
                    if sale_update.sale_fees_inr is not None
                    else sale.sale_fees_inr
                ),
                "payment_methods": (
                    sale_update.payment_methods
                    if sale_update.payment_methods is not None
                    else sale.payment_methods
                ),
            }
            if (
                not completion_fields["min_order_inr"]
                or not completion_fields["max_order_inr"]
                or not completion_fields["usdt_for_sale"]
                or not completion_fields["payment_methods"]
                or completion_fields["sale_fees_inr"] is None
            ):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Cannot mark sale phase complete: all fields must be filled",
                )

        for field, value in sale_update.model_dump(
            exclude={"add_orders", "delete_order_ids"}, exclude_unset=True
        ).items():
            setattr(sale, field, value)

        await _recompute_sale_phase(session, sale)

    if buy:
        await _recompute_cycle(session, cycle, buy, deposit, sale)

    await session.commit()
    return await get_cycle_by_id(session, cycle_id)


async def delete_cycle(session: AsyncSession, cycle_id: uuid.UUID) -> None:
    """Delete a cycle and all its associated phases and orders.

    ORM cascade handles child deletion: cycle → phases → sale orders.
    """
    cycle = await _get_cycle_or_404(session, cycle_id)
    _check_immutable(cycle)
    session.delete(cycle)
    await session.commit()
