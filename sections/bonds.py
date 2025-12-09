"""
Bonds section implementation (mock).
"""
from typing import Any

from pydantic import BaseModel

from validation.common import CommonParams
from validation.sections import BondsParams
from .base import BaseSection


class BondsSection(BaseSection):
    """Mock implementation for bonds positions."""

    name = "bonds"
    params_model = BondsParams

    async def execute(self, common: CommonParams, params: BondsParams) -> dict[str, Any]:
        """Return mock bonds data."""
        return {
            "positions": [
                {
                    "instrument": "US10Y",
                    "notional": 10000000,
                    "yield": params.yield_override or 4.25,
                    "spread": params.spread_override or 0.015,
                    "dv01": 8500.00,
                },
                {
                    "instrument": "US30Y",
                    "notional": 5000000,
                    "yield": params.yield_override or 4.55,
                    "spread": params.spread_override or 0.022,
                    "dv01": 15200.00,
                },
            ],
            "metadata": {
                "time_of_day": common.time_of_day,
                "books": common.books,
                "pos_date": common.pos_date,
                "env_date": common.env_date,
                "overrides_applied": {
                    "spread": params.spread_override is not None,
                    "yield": params.yield_override is not None,
                },
            },
        }
