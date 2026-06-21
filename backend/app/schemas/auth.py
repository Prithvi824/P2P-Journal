"""Pydantic schemas for authentication endpoints."""

# 3rd party imports
from pydantic import BaseModel


class LoginRequest(BaseModel):
    """Credentials submitted to the login endpoint."""

    username: str
    password: str


class TokenResponse(BaseModel):
    """JWT access token returned after successful authentication."""

    access_token: str
    token_type: str = "bearer"
