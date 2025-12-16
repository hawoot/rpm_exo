"""
Thread-safe cache storage.
"""

import threading
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple


_cache: Dict[tuple, Tuple[Dict[str, Any], str]] = {}  # key -> (sections, cached_at)
_cache_lock = threading.Lock()


def get_from_cache(key: tuple) -> Optional[Dict[str, Any]]:
    """Get cached sections or None."""
    with _cache_lock:
        entry = _cache.get(key)
        return entry[0] if entry else None


def write_to_cache(key: tuple, sections: Dict[str, Any]) -> None:
    """Write sections to cache with timestamp."""
    with _cache_lock:
        cached_at = datetime.now(timezone.utc).isoformat()
        _cache[key] = (sections, cached_at)


def get_cache_info() -> Dict[str, Any]:
    """Cache stats for /status endpoint. Shows key + cached_at only."""
    with _cache_lock:
        return {
            "size": len(_cache),
            "entries": [
                {"key": str(k), "cached_at": v[1]}
                for k, v in _cache.items()
            ],
        }
