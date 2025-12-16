"""
Orchestrates parallel section fetching.
"""

import asyncio
from typing import Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor

from .params import BaseParams
from .sections.base import run_section
from .sections.futures import get_futures
from .sections.bonds import get_bonds
from . import config


executor = ThreadPoolExecutor(max_workers=10)


async def fetch_all_sections(
    params: BaseParams,
    section_params: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Fetch all sections in parallel.

    Called by:
        - GET handler (cache miss)
        - POST handler (always fresh)
        - Warmup threads (via sync wrapper)
    """
    section_params = section_params or {}

    # Define sections to fetch
    sections_to_fetch = {
        "futures": (get_futures, section_params.get("futures", {})),
        "bonds": (get_bonds, section_params.get("bonds", {})),
        # Add more sections here
    }

    loop = asyncio.get_event_loop()
    futures_map = {}

    # Submit all to executor
    for name, (fetcher_fn, params_for_section) in sections_to_fetch.items():
        timeout = config.TIMEOUTS.get(name, config.TIMEOUTS["default"])
        future = loop.run_in_executor(
            executor,
            run_section,
            fetcher_fn,
            params,
            params_for_section,
            timeout,
        )
        futures_map[name] = future

    # Collect results
    results = {}
    for name, future in futures_map.items():
        results[name] = await future

    return results


def fetch_all_sections_sync(
    params: BaseParams,
    section_params: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Sync wrapper for warmup threads."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(fetch_all_sections(params, section_params))
    finally:
        loop.close()
