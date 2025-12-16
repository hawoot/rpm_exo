"""
Futures section.
"""

from typing import Dict, Any

from ..params import BaseParams


def get_futures(params: BaseParams, **section_params) -> Dict[str, Any]:
    """
    Fetch futures positions and risk.

    Section params:
        live_price_overrides: Dict[str, float] - contract code -> price override
    """
    live_price_overrides = section_params.get("live_price_overrides", {})

    if not isinstance(live_price_overrides, dict):
        raise ValueError(f"live_price_overrides must be dict, got {type(live_price_overrides).__name__}")

    # TODO: Replace with actual implementation
    return {
        "placeholder": True,
        "env_date": params.env_date,
        "pos_date": params.pos_date,
        "books": params.books,
        "time_of_day": params.time_of_day,
        "overrides_applied": live_price_overrides,
    }
