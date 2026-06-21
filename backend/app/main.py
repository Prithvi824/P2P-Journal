"""FastAPI application factory — registers routers, middleware, and lifespan events."""

# Standard library imports
import asyncio
import logging
from contextlib import asynccontextmanager

# 3rd party imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# local party imports
from app.config import get_settings
from app.database import create_db_and_tables
from app.middleware.logging_middleware import LoggingMiddleware
from app.services.alert_service import run_price_alert_loop

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s"
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create DB tables and start the price-alert background task on startup."""
    await create_db_and_tables()
    alert_task = asyncio.create_task(run_price_alert_loop())
    yield
    alert_task.cancel()


def create_app() -> FastAPI:
    """Build and return the configured FastAPI application."""
    app = FastAPI(title="P2P Trade Journal", version="1.0.0", lifespan=lifespan)

    @app.get("/health", tags=["health"])
    async def health_check():
        return {
            "status": "healthy",
            "service": "p2p-trade-journal",
            "version": "1.0.0",
        }

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request logging
    app.add_middleware(LoggingMiddleware)

    # Routers — imported here to avoid circular imports at module load
    from app.routers.alerts import router as alert_router
    from app.routers.auth import router as auth_router
    from app.routers.binance import router as binance_router
    from app.routers.journal import router as journal_router
    from app.routers.p2p_me import router as p2p_me_router

    app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(p2p_me_router, prefix="/api/v1/p2p-me", tags=["p2p-me"])
    app.include_router(binance_router, prefix="/api/v1/binance", tags=["binance"])
    app.include_router(journal_router, prefix="/api/v1/journal", tags=["journal"])
    app.include_router(alert_router, prefix="/api/v1/alerts", tags=["alerts"])

    return app


app = create_app()
