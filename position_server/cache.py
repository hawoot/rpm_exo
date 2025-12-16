"""
Thread-safe cache storage.
"""

import threading
from typing import Dict, Any, Optional


_cache: Dict[tuple, Dict[str, Any]] = {}
_cache_lock = threading.Lock()


def get_from_cache(key: tuple) -> Optional[Dict[str, Any]]:
    """Get cached sections or None."""
    with _cache_lock:
        return _cache.get(key)


def write_to_cache(key: tuple, sections: Dict[str, Any]) -> None:
    """Write sections to cache."""
    with _cache_lock:
        _cache[key] = sections


def get_cache_info() -> Dict[str, Any]:
    """Cache stats for /status endpoint."""
    with _cache_lock:
        return {
            "size": len(_cache),
            "keys": [
                {"key": str(k), "sections": list(v.keys())}
                for k, v in _cache.items()
            ],
        }
