"""
Data models for request context storage.
"""
from dataclasses import dataclass, field
from typing import Any


@dataclass
class RequestContext:
    """
    Full context of a request - this IS the response format.
    Stored exactly as returned to the client.
    """
    request_id: str
    timestamp: str
    request_data: dict  # Exact mirror of what was sent (no processing)
    response_data: dict = field(default_factory=dict)
    error_stack: str = ""
    duration_ms: int = 0
    cached: bool = False

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "request_id": self.request_id,
            "timestamp": self.timestamp,
            "duration_ms": self.duration_ms,
            "cached": self.cached,
            "request_data": self.request_data,
            "response_data": self.response_data,
            "error_stack": self.error_stack,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RequestContext":
        """Create from dictionary."""
        return cls(
            request_id=data["request_id"],
            timestamp=data["timestamp"],
            duration_ms=data.get("duration_ms", 0),
            cached=data.get("cached", False),
            request_data=data["request_data"],
            response_data=data.get("response_data", {}),
            error_stack=data.get("error_stack", ""),
        )
