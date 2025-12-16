"""
Base wrapper for running sections.
"""

import time
import traceback
from typing import Callable, Dict, Any
from datetime import datetime, timezone

from ..params import BaseParams


def run_section(
    fetcher_fn: Callable,
    params: BaseParams,
    section_params: Dict[str, Any],
    timeout: int,
) -> Dict[str, Any]:
    """
    Run a section with timing and error handling.

    Returns:
        {
            "data": result or None,
            "metadata": {"last_updated", "status", "refresh_duration_ms"},
            "error_stack": "" or full traceback
        }
    """
    start = time.time()

    try:
        data = fetcher_fn(params=params, **section_params)
        duration_ms = int((time.time() - start) * 1000)

        return {
            "data": data,
            "metadata": {
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "status": "ok",
                "refresh_duration_ms": duration_ms,
            },
            "error_stack": "",
        }

    except Exception:
        duration_ms = int((time.time() - start) * 1000)

        return {
            "data": None,
            "metadata": {
                "last_updated": None,
                "status": "error",
                "refresh_duration_ms": duration_ms,
            },
            "error_stack": traceback.format_exc(),
        }
