"""
New Trades section implementation (mock).
"""
from typing import Any

from pydantic import BaseModel

from validation.common import CommonParams
from validation.sections import NewTradesParams
from .base import BaseSection


class NewTradesSection(BaseSection):
    """Mock implementation for new trades."""

    name = "new_trades"
    params_model = NewTradesParams

    async def execute(self, common: CommonParams, params: NewTradesParams) -> dict[str, Any]:
        """Return mock new trades data."""
        trades = [
            {
                "trade_id": "TRD001",
                "instrument": "ES_H25",
                "side": "BUY",
                "quantity": 25,
                "price": 5020.00,
                "trade_date": common.pos_date,
                "settlement_date": common.pos_date,
            },
            {
                "trade_id": "TRD002",
                "instrument": "US10Y",
                "side": "SELL",
                "notional": 5000000,
                "yield": 4.28,
                "trade_date": common.pos_date,
                "settlement_date": common.pos_date,
            },
        ]

        # Add T+1 trades if requested
        if params.include_tplus1:
            trades.extend([
                {
                    "trade_id": "TRD003",
                    "instrument": "NQ_H25",
                    "side": "BUY",
                    "quantity": 10,
                    "price": 17800.00,
                    "trade_date": common.pos_date,
                    "settlement_date": "T+1",
                },
            ])

        return {
            "trades": trades,
            "count": len(trades),
            "metadata": {
                "time_of_day": common.time_of_day,
                "books": common.books,
                "pos_date": common.pos_date,
                "env_date": common.env_date,
                "include_tplus1": params.include_tplus1,
            },
        }
