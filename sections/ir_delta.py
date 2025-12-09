"""
IR Delta section implementation (mock).
"""
from typing import Any

from pydantic import BaseModel

from validation.common import CommonParams
from validation.sections import IRDeltaParams
from .base import BaseSection


class IRDeltaSection(BaseSection):
    """Mock implementation for IR delta calculations."""

    name = "ir_delta"
    params_model = IRDeltaParams

    async def execute(self, common: CommonParams, params: IRDeltaParams) -> dict[str, Any]:
        """Return mock IR delta data."""
        curve = params.curve_override or "USD_SOFR"
        shift = params.shift_bps or 1.0

        return {
            "deltas": [
                {"tenor": "1M", "delta": 1250.00 * shift},
                {"tenor": "3M", "delta": 3420.00 * shift},
                {"tenor": "6M", "delta": 5890.00 * shift},
                {"tenor": "1Y", "delta": 12500.00 * shift},
                {"tenor": "2Y", "delta": 28400.00 * shift},
                {"tenor": "5Y", "delta": 45200.00 * shift},
                {"tenor": "10Y", "delta": 62100.00 * shift},
                {"tenor": "30Y", "delta": 38900.00 * shift},
            ],
            "total_delta": 197660.00 * shift,
            "metadata": {
                "time_of_day": common.time_of_day,
                "books": common.books,
                "pos_date": common.pos_date,
                "env_date": common.env_date,
                "curve": curve,
                "shift_bps": shift,
            },
        }
