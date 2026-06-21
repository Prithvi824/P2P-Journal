"""Controlled value lists shared between validators and the frontend."""

NETWORKS: list[str] = [
    "SOL",
    "XRP",
    "TRON",
    "TRC20",
    "BEP20",
    "ERC20",
    "MATIC",
    "AVAX",
    "LTC",
    "BTC",
    "BASE",
    "XLM",
    "ADA",
    "ALGO",
    "DOT",
]

COINS: list[str] = [
    "USDT",
    "USDC",
    "XRP",
    "SOL",
    "BNB",
    "XLM",
    "TRX",
    "ETH",
    "ADA",
    "MATIC",
]

PAYMENT_METHODS: list[str] = [
    "UPI",
    "GPay",
    "PhonePe",
    "Paytm",
    "IMPS",
    "NEFT",
    "Bank Transfer",
    "Digital E-Rupee",
]

TRADE_TYPES: list[str] = ["BUY", "SELL"]

PHASE_STATUSES: list[str] = ["not_started", "in_progress", "completed"]

CYCLE_STATUSES: list[str] = ["buying", "depositing", "selling", "completed"]
