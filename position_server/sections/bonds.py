"""
Bonds section.
"""

from typing import Dict, Any

from ..params import BaseParams


def get_bonds(params: BaseParams, **section_params) -> Dict[str, Any]:
    """
    Fetch bond positions, prices, P&L.

    Section params:
        exclude_isins: List[str] - ISINs to exclude
    """
    exclude_isins = section_params.get("exclude_isins", [])

    if not isinstance(exclude_isins, list):
        raise ValueError(f"exclude_isins must be list, got {type(exclude_isins).__name__}")

    # TODO: Replace with actual implementation
    return {
        "placeholder": True,
        "env_date": params.env_date,
        "pos_date": params.pos_date,
        "books": params.books,
        "time_of_day": params.time_of_day,
        "excluded_isins": exclude_isins,
    }
