"""
Futures section implementation (mock).
"""
from typing import Any

from pydantic import BaseModel

from validation.common import CommonParams
from validation.sections import FuturesParams
from .base import BaseSection


class FuturesSection(BaseSection):
    """Mock implementation for futures positions."""

    name = "futures"
    params_model = FuturesParams

    async def execute(self, common: CommonParams, params: FuturesParams) -> dict[str, Any]:
        """Return mock futures data."""
        return {
            "positions": [
                {
                    "instrument": "ES_H25",
                    "quantity": 100,
                    "price": params.eod_price_override or 5025.50,
                    "pnl": 12500.00,
                },
                {
                    "instrument": "NQ_H25",
                    "quantity": -50,
                    "price": params.eod_price_override or 17850.25,
                    "pnl": -8750.00,
                },
            ],
            "metadata": {
                "time_of_day": common.time_of_day,
                "books": common.books,
                "pos_date": common.pos_date,
                "env_date": common.env_date,
                "overrides_applied": {
                    "eod_price": params.eod_price_override is not None,
                    "open_price": params.open_price_override is not None,
                    "current_price": params.current_price_override is not None,
                },
            },
        }
