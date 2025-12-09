"""
Position Environment handler - main endpoint.
"""
import time
import traceback
import uuid
from datetime import datetime, timezone
from typing import Any

from cache import get_cache, build_cache_key, get_ttl_for_sections
from exceptions import ValidationError
from sections import get_section
from storage import RequestContext, get_store
from validation import validate_common_params, validate_section_params, resolve_sections

from .base import BaseHandler


def generate_request_id() -> str:
    """Generate a unique request ID."""
    return str(uuid.uuid4())


def now_iso() -> str:
    """Get current timestamp in ISO format."""
    return datetime.now(timezone.utc).isoformat()


class PosEnvHandler(BaseHandler):
    """
    Handler for /pos_env endpoint.
    Supports GET (cacheable) and POST (not cached).
    """

    async def get(self) -> None:
        """GET with shared params - cacheable."""
        raw_params = self.parse_get_params()
        await self._handle(raw_params, use_cache=True)

    async def post(self) -> None:
        """POST with nested JSON - not cached."""
        raw_params = self.parse_post_body()
        await self._handle(raw_params, use_cache=False)

    async def _handle(self, raw_params: dict, use_cache: bool) -> None:
        """
        Main handler logic - same for GET and POST.
        """
        context = RequestContext(
            request_id=generate_request_id(),
            timestamp=now_iso(),
            request_data=raw_params,
        )
        start_time = time.time()

        try:
            # Validate common params first (fail fast)
            common = validate_common_params(raw_params)
            sections_to_run = resolve_sections(common.section)

            # Check cache (GET only)
            if use_cache:
                cache = get_cache()
                cache_key = build_cache_key(raw_params)
                ttl = get_ttl_for_sections(sections_to_run)
                cached = cache.get(cache_key, ttl)
                if cached is not None:
                    # Return cached response with updated metadata
                    cached_copy = cached.copy()
                    cached_copy["request_id"] = context.request_id
                    cached_copy["timestamp"] = context.timestamp
                    cached_copy["cached"] = True
                    cached_copy["request_data"] = raw_params
                    self.write_response(cached_copy)
                    return

            # Validate section-specific params
            section_params = validate_section_params(raw_params, sections_to_run)

            # Execute all sections
            response_data = await self._run_sections(common, section_params)

            context.response_data = response_data
            context.error_stack = ""

            # Cache results (GET only)
            if use_cache:
                cache = get_cache()
                cache_key = build_cache_key(raw_params)
                ttl = get_ttl_for_sections(sections_to_run)
                cache.set(cache_key, context.to_dict(), ttl)

        except Exception:
            context.response_data = {}
            context.error_stack = traceback.format_exc()

        # Calculate duration
        context.duration_ms = int((time.time() - start_time) * 1000)
        context.cached = False

        # Store request context
        store = get_store()
        await store.save(context)

        # Response = stored context
        self.write_response(context.to_dict())

    async def _run_sections(
        self, common, section_params: dict
    ) -> dict[str, Any]:
        """
        Execute all requested sections and collect results.
        """
        results = {}

        for section_name, params in section_params.items():
            section = get_section(section_name)
            result = await section.execute(common, params)
            results[section_name] = result

        return results
