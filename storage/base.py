"""
Abstract base class for request storage.
"""
from abc import ABC, abstractmethod

from .models import RequestContext


class RequestStore(ABC):
    """
    Abstract base for request storage.
    Implement this to use different storage backends (files, Hydra, etc.)
    """

    @abstractmethod
    async def save(self, context: RequestContext) -> None:
        """Save a request context."""
        pass

    @abstractmethod
    async def load(self, request_id: str) -> RequestContext:
        """Load a request context by ID."""
        pass
