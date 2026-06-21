"""Background price-alert loop — checks p2p.me price every 60 s."""

# Standard library imports
import asyncio
import logging
from datetime import UTC, datetime, timedelta

# 3rd party imports
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# local party imports
from app.database import engine
from app.models.user import User
from app.services.gotify_service import send_price_alert
from app.services.p2p_me_service import get_inr_price

logger = logging.getLogger(__name__)

_ALERT_INTERVAL = timedelta(minutes=5)


async def run_price_alert_loop() -> None:
    """Infinite loop: fetch price every 60 s, notify users below threshold.

    Re-alerts every 5 minutes while the price remains below threshold.
    Swallows all exceptions so the loop never brings down the server.
    """
    await asyncio.sleep(10)  # let the server finish startup before first check
    while True:
        try:
            price = await get_inr_price()
            async with AsyncSession(engine, expire_on_commit=False) as session:
                result = (
                    await session.execute(
                        select(User).where(User.price_alert_threshold.isnot(None))
                    )
                ).scalars()
                users = result.all()
                now = datetime.now(UTC)
                for user in users:
                    if price.buy_price >= user.price_alert_threshold:  # type: ignore[operator]
                        continue
                    last = user.last_alert_sent_at
                    if last is not None and (now - last) < _ALERT_INTERVAL:
                        continue
                    await send_price_alert(price.buy_price, user.price_alert_threshold)  # type: ignore[arg-type]
                    user.last_alert_sent_at = now
                    session.add(user)
                await session.commit()
        except asyncio.CancelledError:
            raise  # allow clean shutdown
        except Exception:
            logger.exception("Unhandled error in price alert loop")
        await asyncio.sleep(60)
