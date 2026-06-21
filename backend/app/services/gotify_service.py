"""Gotify push notification service."""

# Standard library imports
import logging

# 3rd party imports
import httpx

# local party imports
from app.config import get_settings

logger = logging.getLogger(__name__)


async def send_price_alert(buy_price: float, threshold: float) -> None:
    """POST a price-drop alert to the configured Gotify server.

    Fails silently — logs the error and returns without raising so the
    background loop is never interrupted by a notification failure.
    """
    settings = get_settings()
    if not settings.gotify_url or not settings.gotify_app_token:
        logger.warning("Gotify not configured — skipping notification")
        return

    url = f"{settings.gotify_url.rstrip('/')}/message"
    payload = {
        "title": "P2P Price Alert",
        "message": (
            f"Buy price ₹{buy_price:.2f} has dropped below "
            f"your threshold of ₹{threshold:.2f}"
        ),
        "priority": 7,
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                url,
                json=payload,
                params={"token": settings.gotify_app_token},
            )
            resp.raise_for_status()
    except Exception as exc:
        logger.error("Failed to send Gotify notification: %s", exc)
