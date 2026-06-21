"""Alembic migration environment — connects to PostgreSQL using sync psycopg2 driver."""

# Standard library imports
import sys
from logging.config import fileConfig
from pathlib import Path

# 3rd party imports
from sqlalchemy import engine_from_config, pool

from alembic import context

# Make sure backend/ is on the path so app.* imports resolve
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

# Import all models so Alembic can detect them for autogenerate
import app.models  # noqa: F401, E402 — side-effect import registers metadata

# local party imports
from app.config import get_settings  # noqa: E402
from app.models.base import Base  # noqa: E402

settings = get_settings()

alembic_config = context.config
if alembic_config.config_file_name is not None:
    fileConfig(alembic_config.config_file_name)

# Override the URL from settings (uses sync driver for Alembic)
alembic_config.set_main_option("sqlalchemy.url", settings.database_url_sync)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations without a live DB connection (generates SQL script)."""
    url = alembic_config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations against a live PostgreSQL connection."""
    connectable = engine_from_config(
        alembic_config.get_section(alembic_config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
