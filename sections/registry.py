"""
Section registry - single source of truth for available sections.
To add a new section:
1. Create the section file (e.g., my_section.py)
2. Add it to SECTIONS dict below
3. Add its params model to validation/sections.py
4. Add the section name to config.VALID_SECTIONS
"""
from typing import Type

from .base import BaseSection
from .futures import FuturesSection
from .bonds import BondsSection
from .ir_delta import IRDeltaSection
from .new_trades import NewTradesSection


# Single source of truth for all sections
SECTIONS: dict[str, Type[BaseSection]] = {
    "futures": FuturesSection,
    "bonds": BondsSection,
    "ir_delta": IRDeltaSection,
    "new_trades": NewTradesSection,
}


def get_section(name: str) -> BaseSection:
    """
    Get a section instance by name.
    Raises KeyError if section doesn't exist.
    """
    section_class = SECTIONS.get(name)
    if section_class is None:
        raise KeyError(f"Unknown section: {name}")
    return section_class()
