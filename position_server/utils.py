"""
Utility functions.
"""

import uuid
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from .params import BaseParams


def generate_request_id() -> str:
    """Generate unique request ID."""
    return str(uuid.uuid4())


def now_iso() -> str:
    """Current UTC timestamp in ISO format."""
    return datetime.now(timezone.utc).isoformat()


def generate_curl_command(
    request,
    params: Optional[BaseParams],
    section_params: Optional[Dict[str, Any]] = None,
) -> Optional[str]:
    """Generate curl command to replay request."""
    if params is None:
        return None

    base_url = f"{request.protocol}://{request.host}{request.path}"

    if request.method == "GET":
        p = params.to_dict()
        p["books"] = ",".join(p["books"])
        qs = "&".join(f"{k}={v}" for k, v in p.items())
        return f"curl -X GET '{base_url}?{qs}'"

    elif request.method == "POST":
        body = params.to_dict()
        if section_params:
            body["section_params"] = section_params
        return f"curl -X POST '{base_url}' -H 'Content-Type: application/json' -d '{json.dumps(body)}'"

    return None
