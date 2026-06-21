"""Authentication router — login and current-user endpoints."""

# 3rd party imports
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

# local party imports
from app.models.user import User
from app.database import get_session
from app.schemas.auth import LoginRequest, TokenResponse, UserMeResponse
from app.services.auth_service import authenticate_user, create_access_token, get_current_user

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    """Authenticate a user and return a JWT access token."""
    user = await authenticate_user(session, body.username, body.password)
    token = create_access_token(subject=user.username)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserMeResponse)
async def me(current_user: User = Depends(get_current_user)) -> UserMeResponse:
    """Return the authenticated user's username."""
    return UserMeResponse(username=current_user.username)
