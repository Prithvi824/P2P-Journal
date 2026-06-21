"""Async PostgreSQL database engine and session dependency."""

# Standard library imports
from collections.abc import AsyncGenerator

# 3rd party imports
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

# local party imports
from app.config import get_settings

settings = get_settings()

engine = create_async_engine(settings.database_url, echo=False, future=True)


async def create_db_and_tables() -> None:
    """Create all mapped tables if they don't yet exist."""
    from app.models.base import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session for use as a FastAPI dependency."""
    # expire_on_commit=False keeps attribute values accessible after commit without
    # triggering a lazy-load — required in async context where implicit IO raises MissingGreenlet.
    async with AsyncSession(engine, expire_on_commit=False) as session:
        yield session
