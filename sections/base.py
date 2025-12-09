"""
Abstract base class for section implementations.
"""
from abc import ABC, abstractmethod
from typing import Any, Type

from pydantic import BaseModel

from validation.common import CommonParams


class BaseSection(ABC):
    """
    Base class for all section implementations.
    Each section must define its name, params model, and execute method.
    """

    name: str
    params_model: Type[BaseModel]

    @abstractmethod
    async def execute(self, common: CommonParams, params: BaseModel) -> dict[str, Any]:
        """
        Execute the section logic and return results.

        Args:
            common: Common parameters (time_of_day, books, dates, etc.)
            params: Section-specific parameters (validated against params_model)

        Returns:
            Dictionary of results for this section
        """
        pass

    def get_params_schema(self) -> dict:
        """Return JSON schema for this section's parameters."""
        return self.params_model.model_json_schema()
