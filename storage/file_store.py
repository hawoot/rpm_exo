"""
File-based request storage implementation.
"""
import json
import os
from pathlib import Path
from typing import Optional

from config import REQUEST_STORAGE_DIR
from exceptions import StorageError
from .base import RequestStore
from .models import RequestContext


class FileRequestStore(RequestStore):
    """
    Store request contexts as JSON files.
    File naming: {request_id}.json
    """

    def __init__(self, storage_dir: str = REQUEST_STORAGE_DIR):
        self.storage_dir = Path(storage_dir)
        self._ensure_dir()

    def _ensure_dir(self) -> None:
        """Ensure storage directory exists."""
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def _get_path(self, request_id: str) -> Path:
        """Get file path for a request ID."""
        return self.storage_dir / f"{request_id}.json"

    async def save(self, context: RequestContext) -> None:
        """Save a request context to a JSON file."""
        try:
            path = self._get_path(context.request_id)
            with open(path, "w") as f:
                json.dump(context.to_dict(), f, indent=2)
        except Exception as e:
            raise StorageError(f"Failed to save request {context.request_id}: {e}")

    async def load(self, request_id: str) -> RequestContext:
        """Load a request context from a JSON file."""
        try:
            path = self._get_path(request_id)
            if not path.exists():
                raise StorageError(f"Request {request_id} not found")
            with open(path) as f:
                data = json.load(f)
            return RequestContext.from_dict(data)
        except StorageError:
            raise
        except Exception as e:
            raise StorageError(f"Failed to load request {request_id}: {e}")


# Global store instance
_store: Optional[FileRequestStore] = None


def get_store() -> FileRequestStore:
    """Get the global store instance."""
    global _store
    if _store is None:
        _store = FileRequestStore()
    return _store
