"""Pure functions for computing derived fields in the trade cycle data model.

All functions are stateless — they take plain values, perform arithmetic, and
return a result. No DB calls are made here; the journal service orchestrates
when these are called and persists the results.
"""

# local party imports
from app.models.buying import BuyingPhase
from app.models.deposit import DepositPhase
from app.models.sale import SaleOrder, SalePhase


def compute_coin_value_inr(price_per_coin: float, coins_received: float) -> float:
    """Return the INR value of the coins at the purchase price."""
    return price_per_coin * coins_received


def compute_purchase_fees(inr_spent: float, coin_value_inr: float) -> float:
    """Return the effective purchase fees paid (spread / platform fee)."""
    return inr_spent - coin_value_inr


def compute_cost_per_usdt(inr_spent: float, usdt_received: float) -> float:
    """Return the all-in INR cost per USDT after deposit and conversion."""
    if usdt_received == 0:
        return 0.0
    return inr_spent / usdt_received


def compute_avg_price_per_usdt(orders: list[SaleOrder]) -> float:
    """Return the weighted-average sell price per USDT across all orders."""
    total_inr = sum(o.inr_received for o in orders if o.inr_received is not None)
    total_usdt = sum(o.usdt_sold for o in orders if o.usdt_sold is not None)
    if total_usdt == 0:
        return 0.0
    return total_inr / total_usdt


def compute_total_usdt_sold(orders: list[SaleOrder]) -> float:
    """Return the sum of USDT sold across all orders."""
    return sum(o.usdt_sold for o in orders if o.usdt_sold is not None)


def compute_total_inr_received(orders: list[SaleOrder]) -> float:
    """Return the sum of INR received across all orders."""
    return sum(o.inr_received for o in orders if o.inr_received is not None)


def compute_remaining_usdt(usdt_for_sale: float, total_usdt_sold: float) -> float:
    """Return the USDT still available for sale."""
    return max(0.0, usdt_for_sale - total_usdt_sold)


def compute_remaining_value_inr(avg_price_per_usdt: float, remaining_usdt: float) -> float:
    """Return the estimated INR value of unsold USDT at the current average price."""
    return avg_price_per_usdt * remaining_usdt


def compute_pnl(
    total_inr_spent: float,
    total_inr_received: float,
    avg_price_per_usdt: float,
    remaining_usdt: float,
) -> float:
    """Return PNL: (INR received + value of remaining USDT) - INR spent."""
    return total_inr_received - total_inr_spent + avg_price_per_usdt * remaining_usdt


def compute_total_fees(purchase_fees_inr: float, sale_fees_inr: float) -> float:
    """Return the combined fees from both the buy and sell phases."""
    return purchase_fees_inr + sale_fees_inr


def infer_cycle_status(
    buy: BuyingPhase,
    deposit: DepositPhase | None,
    sale: SalePhase | None,
    remaining_usdt: float = 0.0,
) -> str:
    """Infer the current cycle status from the completion state of each phase.

    A cycle is only 'completed' when all three phases are done AND all USDT is sold.
    """
    if buy.status != "completed":
        return "buying"
    if deposit is None or deposit.status != "completed":
        return "depositing"
    if sale is None or sale.status != "completed":
        return "selling"
    return "completed"


def _all_buy_fields_set(buy: BuyingPhase) -> bool:
    """Return True when all user-input BuyingPhase fields are populated."""
    return all([
        buy.platform is not None,
        buy.price_per_coin is not None,
        buy.coins_received is not None,
        buy.inr_spent is not None,
    ])


def _all_deposit_fields_set(deposit: DepositPhase) -> bool:
    """Return True when all user-input DepositPhase fields are populated."""
    return all([
        deposit.source_platform is not None,
        deposit.coin_symbol is not None,
        deposit.network is not None,
        deposit.coins_deposited is not None,
        deposit.usdt_received is not None,
    ])


def _all_sale_fields_set(sale: SalePhase) -> bool:
    """Return True when all user-input SalePhase fields are populated."""
    return all([
        sale.min_order_inr is not None,
        sale.max_order_inr is not None,
        sale.usdt_for_sale is not None,
        sale.payment_methods is not None and len(sale.payment_methods) > 0,
        sale.sale_fees_inr is not None,
    ])


def validate_phase_completion(phase_name: str, phase_obj) -> list[str]:
    """Return a list of missing required field names preventing phase completion."""
    missing: list[str] = []
    if phase_name == "buy":
        if not isinstance(phase_obj, BuyingPhase):
            return []
        for field in ["platform", "price_per_coin", "coins_received", "inr_spent"]:
            if getattr(phase_obj, field) is None:
                missing.append(field)
    elif phase_name == "deposit":
        if not isinstance(phase_obj, DepositPhase):
            return []
        for field in ["source_platform", "coin_symbol", "network", "coins_deposited", "usdt_received"]:
            if getattr(phase_obj, field) is None:
                missing.append(field)
    elif phase_name == "sale":
        if not isinstance(phase_obj, SalePhase):
            return []
        for field in ["min_order_inr", "max_order_inr", "usdt_for_sale", "sale_fees_inr"]:
            if getattr(phase_obj, field) is None:
                missing.append(field)
        if not phase_obj.payment_methods:
            missing.append("payment_methods")
    return missing
