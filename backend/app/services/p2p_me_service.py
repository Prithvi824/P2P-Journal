"""Fetches INR/USDC buy and sell prices from the Diamond contract on Base chain."""

# Standard library imports
import asyncio
from datetime import UTC, datetime

# 3rd party imports
from fastapi import HTTPException, status
from web3 import Web3

# local party imports
from app.config import get_settings
from app.schemas.price import PricePoint

settings = get_settings()

_ABI = [
    {
        "name": "getPriceConfig",
        "type": "function",
        "stateMutability": "view",
        "inputs": [{"name": "_currency", "type": "bytes32"}],
        "outputs": [
            {"name": "buyPrice", "type": "uint256"},
            {"name": "sellPrice", "type": "uint256"},
            {"name": "buyPriceOffset", "type": "int256"},
            {"name": "baseSpread", "type": "uint256"},
        ],
    }
]

# Contract stores prices as scaled integers; 1e6 yields the INR float.
_SCALE = 1e6


def _fetch_sync(currency: str) -> tuple[float, float]:
    """Call the Diamond contract synchronously — must not run on the event loop thread."""
    w3 = Web3(Web3.HTTPProvider(settings.base_rpc_url))
    address = Web3.to_checksum_address(settings.diamond_address)
    contract = w3.eth.contract(address=address, abi=_ABI)
    enc = currency.encode().ljust(32, b"\x00")
    buy_raw, sell_raw, _, _ = contract.functions.getPriceConfig(enc).call()
    return buy_raw / _SCALE, sell_raw / _SCALE


async def get_inr_price() -> PricePoint:
    """Return the current INR buy/sell price from the Base chain Diamond contract."""
    try:
        buy_price, sell_price = await asyncio.to_thread(_fetch_sync, "INR")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch price from contract: {exc}",
        ) from exc
    return PricePoint(timestamp=datetime.now(UTC), buy_price=buy_price, sell_price=sell_price)
