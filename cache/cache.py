"""
In-memory TTL cache for GET requests.
"""
import hashlib
import json
from typing import Any, Optional

from cachetools import TTLCache

from config import DEFAULT_CACHE_TTL, SECTION_TTL


class RequestCache:
    """TTL-based cache for request results."""

    def __init__(self, maxsize: int = 1000):
        # Use a dict of TTLCache instances, one per TTL value
        # This allows different TTLs for different sections
        self._caches: dict[int, TTLCache] = {}
        self._maxsize = maxsize

    def _get_cache(self, ttl: int) -> TTLCache:
        """Get or create a cache for a specific TTL."""
        if ttl not in self._caches:
            self._caches[ttl] = TTLCache(maxsize=self._maxsize, ttl=ttl)
        return self._caches[ttl]

    def get(self, key: str, ttl: int = DEFAULT_CACHE_TTL) -> Optional[dict]:
        """Get a cached result by key."""
        cache = self._get_cache(ttl)
        return cache.get(key)

    def set(self, key: str, value: dict, ttl: int = DEFAULT_CACHE_TTL) -> None:
        """Set a cached result."""
        cache = self._get_cache(ttl)
        cache[key] = value

    def clear(self) -> None:
        """Clear all caches."""
        self._caches.clear()


def build_cache_key(request_data: dict) -> str:
    """
    Build a cache key from request data.
    Uses a hash of the sorted JSON representation for consistency.
    """
    # Sort keys for consistent hashing
    serialized = json.dumps(request_data, sort_keys=True)
    return hashlib.sha256(serialized.encode()).hexdigest()


def get_ttl_for_sections(sections: list[str]) -> int:
    """
    Get the minimum TTL for a list of sections.
    Uses the minimum to ensure cache doesn't serve stale data.
    """
    if not sections:
        return DEFAULT_CACHE_TTL

    ttls = [SECTION_TTL.get(s, DEFAULT_CACHE_TTL) for s in sections]
    return min(ttls)


# Global cache instance
_cache: Optional[RequestCache] = None


def get_cache() -> RequestCache:
    """Get the global cache instance."""
    global _cache
    if _cache is None:
        _cache = RequestCache()
    return _cache
