"""P2P.me router — exposes current INR price from the Base chain Diamond contract."""

# 3rd party imports
from fastapi import APIRouter, Depends

# local party imports
from app.models.user import User
from app.schemas.price import PricePoint
from app.services.auth_service import get_current_user
from app.services.p2p_me_service import get_inr_price

router = APIRouter()


@router.get("/get-price", response_model=PricePoint)
async def fetch_price(_: User = Depends(get_current_user)) -> PricePoint:
    """Return the current INR buy/sell price from the p2p.me Diamond contract."""
    return await get_inr_price()
