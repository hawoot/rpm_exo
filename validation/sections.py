"""
Section-specific parameter validation models.
Each section defines its own optional/required parameters here.
"""
from typing import Optional

from pydantic import BaseModel


class FuturesParams(BaseModel):
    """Parameters specific to futures section."""
    eod_price_override: Optional[float] = None
    open_price_override: Optional[float] = None
    current_price_override: Optional[float] = None


class BondsParams(BaseModel):
    """Parameters specific to bonds section."""
    spread_override: Optional[float] = None
    yield_override: Optional[float] = None


class IRDeltaParams(BaseModel):
    """Parameters specific to ir_delta section."""
    curve_override: Optional[str] = None
    shift_bps: Optional[float] = None


class NewTradesParams(BaseModel):
    """Parameters specific to new_trades section."""
    include_tplus1: bool  # This is mandatory


# Map section names to their param models
SECTION_PARAMS_MAP = {
    "futures": FuturesParams,
    "bonds": BondsParams,
    "ir_delta": IRDeltaParams,
    "new_trades": NewTradesParams,
}
