"""Journal router — CRUD for trade cycles."""

# Standard library imports
import uuid

# 3rd party imports
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

# local party imports
from app.database import get_session
from app.models.user import User
from app.schemas.cycle import TradeCycleListItem, TradeCycleRead, TradeCycleUpdate
from app.services.auth_service import get_current_user
from app.services.journal_service import (
    create_cycle,
    delete_cycle,
    get_all_cycles,
    get_cycle_by_id,
    update_cycle,
)

router = APIRouter()


@router.get("/get-cycles", response_model=list[TradeCycleListItem])
async def list_cycles(
    session: AsyncSession = Depends(get_session),
    _: User = Depends(get_current_user),
) -> list[TradeCycleListItem]:
    """Return a lightweight list of all trade cycles for the dashboard."""
    return await get_all_cycles(session)


@router.get("/get-cycle/{cycle_id}", response_model=TradeCycleRead)
async def get_cycle(
    cycle_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(get_current_user),
) -> TradeCycleRead:
    """Return a single trade cycle with all nested phases and orders."""
    return await get_cycle_by_id(session, cycle_id)


@router.post("/create-cycle", response_model=TradeCycleRead)
async def new_cycle(
    session: AsyncSession = Depends(get_session),
    _: User = Depends(get_current_user),
) -> TradeCycleRead:
    """Create a new trade cycle with an empty buying phase."""
    return await create_cycle(session)


@router.put("/update-cycle/{cycle_id}", response_model=TradeCycleRead)
async def edit_cycle(
    cycle_id: uuid.UUID,
    payload: TradeCycleUpdate,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(get_current_user),
) -> TradeCycleRead:
    """Partially update a cycle's phases, recomputing all derived fields."""
    return await update_cycle(session, cycle_id, payload)


@router.delete("/delete-cycle/{cycle_id}")
async def remove_cycle(
    cycle_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(get_current_user),
) -> dict[str, str]:
    """Delete a trade cycle and all its phases and orders."""
    await delete_cycle(session, cycle_id)
    return {"message": "Cycle deleted successfully"}
