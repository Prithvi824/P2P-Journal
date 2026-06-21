"""Fetches and filters current P2P ads from Binance."""

# 3rd party imports
import httpx
from fastapi import HTTPException, status

# local party imports
from app.schemas.price import BinanceAd, BinanceAdsResponse

_BINANCE_P2P_URL = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"

_BINANCE_PAY_TYPE_MAP = {
    "UPI": "UPI",
    "GPay": "GPay",
    "PhonePe": "PhonePe",
    "Paytm": "Paytm",
    "IMPS": "IMPS",
    "NEFT": "NEFT",
    "Bank Transfer": "BankTransfer",
    "Digital E-Rupee": "DigitaleRupee",
}


async def fetch_ads(
    trade_type: str = "BUY",
    pay_types: list[str] | None = None,
    trans_amount: int | None = None,
) -> BinanceAdsResponse:
    """Fetch Binance P2P ads, returning structured ad data."""
    binance_pay_types = []
    if pay_types:
        binance_pay_types = [_BINANCE_PAY_TYPE_MAP.get(p, p) for p in pay_types]

    payload: dict = {
        "fiat": "INR",
        "page": 1,
        "rows": 20,
        "tradeType": trade_type,
        "asset": "USDT",
        "countries": [],
        "proMerchantAds": False,
        "shieldMerchantAds": False,
        "filterType": "tradable",
        "periods": [],
        "additionalKycVerifyFilter": 1,
        "publisherType": None,
        "payTypes": binance_pay_types,
        "classifies": ["mass", "profession", "fiat_trade"],
        "tradedWith": False,
        "followed": False,
    }

    if trans_amount is not None:
        payload["transAmount"] = trans_amount

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(_BINANCE_P2P_URL, json=payload)
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch Binance P2P ads: {exc}",
        ) from exc

    ads: list[BinanceAd] = []
    for item in data.get("data", []):
        adv = item.get("adv", {})
        advertiser = item.get("advertiser", {})

        payment_methods = [
            m.get("tradeMethodName", "")
            for m in adv.get("tradeMethods", [])
            if m.get("tradeMethodName") is not None
        ]

        ads.append(
            BinanceAd(
                seller_name=advertiser.get("nickName", ""),
                price_per_usdt=float(adv.get("price", 0)),
                available_usdt=float(adv.get("tradableQuantity", 0)),
                min_order_inr=float(adv.get("minSingleTransAmount", 0)),
                max_order_inr=float(adv.get("maxSingleTransAmount", 0)),
                payment_methods=payment_methods,
                monthly_orders=int(advertiser.get("monthOrderCount", 0)),
            )
        )

    ads.sort(key=lambda a: a.price_per_usdt)
    return BinanceAdsResponse(ads=ads, total=len(ads))
