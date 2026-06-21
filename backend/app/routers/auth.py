"""Authentication router — login endpoint."""

# 3rd party imports
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

# local party imports
from app.database import get_session
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import authenticate_user, create_access_token

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    """Authenticate a user and return a JWT access token."""
    user = await authenticate_user(session, body.username, body.password)
    token = create_access_token(subject=user.username)
    return TokenResponse(access_token=token)
