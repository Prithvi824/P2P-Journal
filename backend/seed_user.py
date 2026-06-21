"""One-time script to create the initial admin user in the database.

Usage:
    uv run python seed_user.py --username admin --email admin@example.com --password secret
"""

# Standard library imports
import argparse
import asyncio

# 3rd party imports
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# local party imports
from app.database import create_db_and_tables, engine
from app.models.user import User
from app.services.auth_service import hash_password


async def seed(username: str, email: str, password: str) -> None:
    """Insert a new user into the database if the username doesn't already exist."""
    await create_db_and_tables()
    async with AsyncSession(engine) as session:
        existing = (
            await session.execute(select(User).where(User.username == username))
        ).scalars()
        if existing.first():
            print(f"User '{username}' already exists — skipping.")
            return
        user = User(
            username=username, email=email, hashed_password=hash_password(password)
        )
        session.add(user)
        await session.commit()
        print(f"User '{username}' created successfully.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the initial application user.")
    parser.add_argument("--username", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()
    asyncio.run(seed(args.username, args.email, args.password))
