"""
Single source of truth for parameters.

To add a new global parameter:
1. Add field to BaseParams dataclass
2. Add to to_cache_key() if it affects caching
3. Add validation in _validate()
"""

import json
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional

from . import config


@dataclass
class BaseParams:
    """Container for all global parameters."""
    env_date: str
    pos_date: str
    books: List[str]
    time_of_day: str

    def to_cache_key(self) -> tuple:
        """Hashable cache key. Books sorted for consistency."""
        return (
            self.env_date,
            self.pos_date,
            tuple(sorted(self.books)),
            self.time_of_day,
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dict for response."""
        return asdict(self)


def extract_from_get(handler) -> BaseParams:
    """Extract and validate from GET query string."""
    env_date = handler.get_query_argument("env_date", None)
    pos_date = handler.get_query_argument("pos_date", None)
    books_raw = handler.get_query_argument("books", None)
    time_of_day = handler.get_query_argument("time_of_day", None)

    # Parse books from CSV
    books = [b.strip() for b in books_raw.split(",")] if books_raw else None

    return _validate(env_date, pos_date, books, time_of_day)


def extract_from_post(handler) -> Tuple[BaseParams, Optional[Dict[str, Any]]]:
    """Extract and validate from POST JSON body. Returns (params, section_params)."""
    try:
        body = json.loads(handler.request.body)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {e}")

    if not isinstance(body, dict):
        raise ValueError("Request body must be a JSON object")

    env_date = body.get("env_date")
    pos_date = body.get("pos_date")
    books = body.get("books")
    time_of_day = body.get("time_of_day")
    section_params = body.get("section_params")

    if section_params is not None and not isinstance(section_params, dict):
        raise ValueError("section_params must be an object")

    params = _validate(env_date, pos_date, books, time_of_day)
    return params, section_params


def build_from_dict(d: Dict[str, Any]) -> BaseParams:
    """Build from dict (for warmup configs)."""
    return _validate(
        d.get("env_date"),
        d.get("pos_date"),
        d.get("books"),
        d.get("time_of_day"),
    )


def _validate(env_date, pos_date, books, time_of_day) -> BaseParams:
    """Validate all parameters and return BaseParams."""
    # env_date
    if not env_date:
        raise ValueError("Missing required parameter: env_date")
    if not isinstance(env_date, str):
        raise ValueError(f"env_date must be string, got {type(env_date).__name__}")
    try:
        datetime.strptime(env_date, config.DATE_FORMAT)
    except ValueError:
        raise ValueError(f"env_date must be {config.DATE_FORMAT} format, got '{env_date}'")

    # pos_date
    if not pos_date:
        raise ValueError("Missing required parameter: pos_date")
    if not isinstance(pos_date, str):
        raise ValueError(f"pos_date must be string, got {type(pos_date).__name__}")
    try:
        datetime.strptime(pos_date, config.DATE_FORMAT)
    except ValueError:
        raise ValueError(f"pos_date must be {config.DATE_FORMAT} format, got '{pos_date}'")

    # books
    if not books:
        raise ValueError("Missing required parameter: books")
    if not isinstance(books, list):
        raise ValueError(f"books must be list, got {type(books).__name__}")
    if len(books) == 0:
        raise ValueError("books cannot be empty")
    if not all(isinstance(b, str) and b.strip() for b in books):
        raise ValueError("books must be non-empty strings")
    books = [b.strip() for b in books]

    # time_of_day
    if not time_of_day:
        raise ValueError("Missing required parameter: time_of_day")
    valid_times = ["SOD", "EOD", "LIVE"]
    if time_of_day not in valid_times:
        raise ValueError(f"time_of_day must be one of {valid_times}, got '{time_of_day}'")

    return BaseParams(
        env_date=env_date,
        pos_date=pos_date,
        books=books,
        time_of_day=time_of_day,
    )
