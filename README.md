Position Environment Server — Technical Specification v2
Overview
Purpose: A pre-computed risk data server that caches position environment data (futures, bonds, etc.) and serves it to trader-facing tools with minimal latency.
Runtime: Python 3.7, Tornado web framework
Key Design Principles:

GET requests read from cache (fast), compute + cache on miss
POST requests always compute fresh (bypass cache, never write to cache)
Background warmup threads pre-compute predefined parameter combinations on schedules
Each section (futures, bonds, etc.) runs in parallel via ThreadPoolExecutor
Errors never crash the server — stale-while-error with full stack traces
Single source of truth for parameters — one file defines, extracts, and validates all global params


Architecture
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Tornado Server                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                              CACHE                                      │ │
│  │                                                                         │ │
│  │  Key: Generated from BaseParams.to_cache_key()                         │ │
│  │  Value: { "futures": {...}, "bonds": {...}, ... }                      │ │
│  │                                                                         │ │
│  │  Protected by: threading.Lock                                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              ▲                                               │
│                              │                                               │
│         ┌────────────────────┴────────────────────┐                         │
│         │                                         │                         │
│   Warmup Threads                            POST Handler                    │
│   (one per WARMUP_CONFIG)                   (on-demand, fresh)              │
│   - Named (e.g., "SOD_MAIN")                - Custom section_params         │
│   - Own schedule                            - Never touches cache           │
│   - Writes to cache                                                         │
│         │                                         │                         │
│         └────────────────────┬────────────────────┘                         │
│                              │                                               │
│                              ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                       fetch_all_sections()                              │ │
│  │                                                                         │ │
│  │   Receives: BaseParams object + optional section_params                 │ │
│  │   Runs all sections in parallel via ThreadPoolExecutor                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

File Structure
position_server/
├── server.py                 # Tornado app setup, routes, main()
├── config.py                 # All configuration
├── params.py                 # THE SOURCE OF TRUTH: BaseParams, extraction, validation
├── cache.py                  # Cache storage + lock (uses BaseParams.to_cache_key())
├── scheduler.py              # Warmup thread management (uses BaseParams)
├── orchestrator.py           # fetch_all_sections() - THE FLOW
├── handlers/
│   ├── __init__.py
│   ├── position_environment.py   # GET/POST handler
│   └── status.py                 # GET /status
├── sections/
│   ├── __init__.py
│   ├── base.py               # run_section() wrapper
│   ├── futures.py            # get_futures()
│   └── bonds.py              # get_bonds()
└── utils.py                  # Helpers: curl generation, timestamps, request_id

The Core Idea: Centralized Parameter Handling
Problem
If env_date, pos_date, books, time_of_day are passed as separate arguments everywhere:

Adding a new global param (e.g., region) requires changes in 10+ places
Easy to miss one, get inconsistent signatures
Validation logic scattered

Solution
One file (params.py) owns everything about parameters:

Definition — What are the global params? (dataclass)
Extraction — How to get them from GET/POST requests?
Validation — Are they valid?
Cache key generation — How to build a cache key?
Serialization — Convert to dict for response echo

Everything else receives a BaseParams object, not individual fields.

params.py — The Source of Truth
python"""
SINGLE SOURCE OF TRUTH FOR PARAMETERS.

To add a new global parameter:
1. Add field to BaseParams dataclass
2. Add to PARAM_DEFINITIONS
3. Add validation in _validate_field()
4. Done. Everything else automatically works.

To remove a parameter:
1. Remove from BaseParams
2. Remove from PARAM_DEFINITIONS
3. Remove validation
4. Done.
"""

import json
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional
from datetime import datetime

import config


# =============================================================================
# PARAMETER DEFINITIONS
# =============================================================================

PARAM_DEFINITIONS = {
    # field_name: {
    #     "required": bool,
    #     "type": type or "list[str]" etc,
    #     "description": str,
    #     "get_parser": callable (for GET query string parsing),
    # }
    "env_date": {
        "required": True,
        "type": str,
        "description": "Environment date (YYYY-MM-DD)",
        "get_parser": lambda x: x,  # string as-is
    },
    "pos_date": {
        "required": True,
        "type": str,
        "description": "Position date (YYYY-MM-DD)",
        "get_parser": lambda x: x,
    },
    "books": {
        "required": True,
        "type": List[str],
        "description": "List of books",
        "get_parser": lambda x: [b.strip() for b in x.split(",")],  # CSV to list
    },
    "time_of_day": {
        "required": True,
        "type": str,
        "description": "Time of day: SOD, EOD, or LIVE",
        "get_parser": lambda x: x,
    },
    # =========================================================================
    # TO ADD A NEW GLOBAL PARAM, ADD IT HERE:
    # "region": {
    #     "required": False,
    #     "type": str,
    #     "description": "Trading region",
    #     "get_parser": lambda x: x,
    #     "default": "EMEA",
    # },
    # =========================================================================
}


# =============================================================================
# BASE PARAMS DATACLASS
# =============================================================================

@dataclass
class BaseParams:
    """
    Container for all global parameters.
    
    This is what gets passed to:
    - orchestrator.fetch_all_sections()
    - Every section function
    - Cache key generation
    - Warmup configs
    
    Add/remove fields here when changing global params.
    """
    env_date: str
    pos_date: str
    books: List[str]
    time_of_day: str
    # Add new fields here:
    # region: str = "EMEA"
    
    def to_cache_key(self) -> tuple:
        """
        Generate a hashable cache key.
        Books are sorted for consistent keys regardless of input order.
        """
        return (
            self.env_date,
            self.pos_date,
            tuple(sorted(self.books)),
            self.time_of_day,
            # Add new fields here:
            # self.region,
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dict for response echo, curl generation, etc."""
        return asdict(self)


@dataclass
class RequestParams:
    """
    Complete request: base params + optional section-specific params.
    This is what the handler extracts and passes to orchestrator.
    """
    base: BaseParams
    section_params: Optional[Dict[str, Any]] = None


# =============================================================================
# EXTRACTION FROM REQUESTS
# =============================================================================

def extract_from_get(handler) -> RequestParams:
    """
    Extract and validate parameters from GET query string.
    
    Args:
        handler: Tornado RequestHandler instance
    
    Returns:
        RequestParams with validated BaseParams
    
    Raises:
        ValueError: If any parameter is missing or invalid
    """
    raw_params = {}
    
    for field_name, definition in PARAM_DEFINITIONS.items():
        required = definition["required"]
        parser = definition["get_parser"]
        default = definition.get("default")
        
        try:
            raw_value = handler.get_query_argument(field_name, default=None)
        except Exception as e:
            raise ValueError(f"Error reading parameter '{field_name}': {e}")
        
        if raw_value is None:
            if required:
                raise ValueError(f"Missing required parameter: {field_name}")
            else:
                raw_params[field_name] = default
        else:
            raw_params[field_name] = parser(raw_value)
    
    base = _validate_and_build(raw_params)
    return RequestParams(base=base, section_params=None)


def extract_from_post(handler) -> RequestParams:
    """
    Extract and validate parameters from POST JSON body.
    
    Args:
        handler: Tornado RequestHandler instance
    
    Returns:
        RequestParams with validated BaseParams and optional section_params
    
    Raises:
        ValueError: If body is invalid JSON or parameters are missing/invalid
    """
    try:
        body = json.loads(handler.request.body)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON body: {e}")
    
    if not isinstance(body, dict):
        raise ValueError(f"Request body must be a JSON object, got {type(body).__name__}")
    
    raw_params = {}
    
    for field_name, definition in PARAM_DEFINITIONS.items():
        required = definition["required"]
        default = definition.get("default")
        
        value = body.get(field_name)
        
        if value is None:
            if required:
                raise ValueError(f"Missing required field: {field_name}")
            else:
                raw_params[field_name] = default
        else:
            raw_params[field_name] = value
    
    base = _validate_and_build(raw_params)
    section_params = body.get("section_params")
    
    # Basic validation of section_params structure
    if section_params is not None and not isinstance(section_params, dict):
        raise ValueError(f"section_params must be an object, got {type(section_params).__name__}")
    
    return RequestParams(base=base, section_params=section_params)


def build_from_dict(d: Dict[str, Any]) -> BaseParams:
    """
    Build BaseParams from a dict (e.g., warmup config).
    Used by scheduler.
    
    Raises:
        ValueError: If parameters are missing or invalid
    """
    raw_params = {}
    
    for field_name, definition in PARAM_DEFINITIONS.items():
        required = definition["required"]
        default = definition.get("default")
        
        value = d.get(field_name)
        
        if value is None:
            if required:
                raise ValueError(f"Missing required field: {field_name}")
            else:
                raw_params[field_name] = default
        else:
            raw_params[field_name] = value
    
    return _validate_and_build(raw_params)


# =============================================================================
# VALIDATION
# =============================================================================

def _validate_and_build(raw_params: Dict[str, Any]) -> BaseParams:
    """
    Validate all parameters and construct BaseParams.
    
    Raises:
        ValueError: If any parameter is invalid
    """
    validated = {}
    
    for field_name, value in raw_params.items():
        validated[field_name] = _validate_field(field_name, value)
    
    return BaseParams(**validated)


def _validate_field(field_name: str, value: Any) -> Any:
    """
    Validate a single field.
    Add validation rules for new fields here.
    
    Raises:
        ValueError: If validation fails
    """
    
    if field_name == "env_date":
        return _validate_date(value, "env_date")
    
    elif field_name == "pos_date":
        return _validate_date(value, "pos_date")
    
    elif field_name == "books":
        if not isinstance(value, list):
            raise ValueError(f"books must be a list, got {type(value).__name__}")
        if len(value) == 0:
            raise ValueError("books cannot be empty")
        if not all(isinstance(b, str) for b in value):
            raise ValueError("all books must be strings")
        if not all(b.strip() for b in value):
            raise ValueError("books cannot contain empty strings")
        return [b.strip() for b in value]
    
    elif field_name == "time_of_day":
        if value not in config.VALID_TIME_OF_DAY:
            raise ValueError(
                f"time_of_day must be one of {config.VALID_TIME_OF_DAY}, got '{value}'"
            )
        return value
    
    # =========================================================================
    # ADD VALIDATION FOR NEW FIELDS HERE:
    # elif field_name == "region":
    #     if value not in ["EMEA", "NA", "APAC"]:
    #         raise ValueError(f"region must be EMEA, NA, or APAC, got '{value}'")
    #     return value
    # =========================================================================
    
    else:
        # Unknown field — just return as-is (shouldn't happen if PARAM_DEFINITIONS is correct)
        return value


def _validate_date(value: Any, field_name: str) -> str:
    """Validate date format."""
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be a string, got {type(value).__name__}")
    try:
        datetime.strptime(value, config.DATE_FORMAT)
    except ValueError:
        raise ValueError(f"{field_name} must be in {config.DATE_FORMAT} format, got '{value}'")
    return value


# =============================================================================
# UTILITIES
# =============================================================================

def get_param_descriptions() -> Dict[str, str]:
    """
    Return descriptions of all parameters.
    Useful for documentation, error messages, /help endpoint.
    """
    return {
        name: defn["description"]
        for name, defn in PARAM_DEFINITIONS.items()
    }

How Adding a Global Parameter Works
Example: Add region parameter (optional, defaults to "EMEA")
Step 1: Add to PARAM_DEFINITIONS
pythonPARAM_DEFINITIONS = {
    # ... existing ...
    "region": {
        "required": False,
        "type": str,
        "description": "Trading region: EMEA, NA, or APAC",
        "get_parser": lambda x: x,
        "default": "EMEA",
    },
}
Step 2: Add to BaseParams dataclass
python@dataclass
class BaseParams:
    env_date: str
    pos_date: str
    books: List[str]
    time_of_day: str
    region: str = "EMEA"  # NEW
    
    def to_cache_key(self) -> tuple:
        return (
            self.env_date,
            self.pos_date,
            tuple(sorted(self.books)),
            self.time_of_day,
            self.region,  # NEW
        )
Step 3: Add validation in _validate_field()
pythonelif field_name == "region":
    valid_regions = ["EMEA", "NA", "APAC"]
    if value not in valid_regions:
        raise ValueError(f"region must be one of {valid_regions}, got '{value}'")
    return value
Step 4: Done

Extraction from GET/POST automatically picks it up
Cache key automatically includes it
All sections receive it via params.region
Response echo automatically includes it
Warmup configs can specify it

No changes needed in:

Handlers
Orchestrator
Section functions (they receive full BaseParams, access params.region if needed)
Cache module
Scheduler


How Other Modules Use params.py
handlers/position_environment.py
python"""
Handler for /position-environment endpoint.
"""

import time
import traceback
from tornado.web import RequestHandler

from params import extract_from_get, extract_from_post, RequestParams
from orchestrator import fetch_all_sections
from cache import get_from_cache, write_to_cache
from utils import generate_request_id, now_iso, generate_curl_command
from scheduler import get_server_status


class PositionEnvironmentHandler(RequestHandler):
    
    async def get(self):
        request_id = generate_request_id()
        request_timestamp = now_iso()
        start_time = time.time()
        
        try:
            # Extract and validate params — one call, fail fast
            request_params = extract_from_get(self)
            base = request_params.base
            
            # Check cache
            cache_key = base.to_cache_key()
            cached = get_from_cache(cache_key)
            
            if cached is not None:
                self._write_response(
                    request_id=request_id,
                    request_timestamp=request_timestamp,
                    start_time=start_time,
                    request_params=request_params,
                    cache_hit=True,
                    sections=cached,
                )
            else:
                # Cache miss — compute and cache
                sections = await fetch_all_sections(base, section_params=None)
                write_to_cache(cache_key, sections)
                
                self._write_response(
                    request_id=request_id,
                    request_timestamp=request_timestamp,
                    start_time=start_time,
                    request_params=request_params,
                    cache_hit=False,
                    sections=sections,
                )
        
        except Exception:
            self._write_error_response(
                request_id=request_id,
                request_timestamp=request_timestamp,
                start_time=start_time,
                error_stack=traceback.format_exc(),
            )
    
    
    async def post(self):
        request_id = generate_request_id()
        request_timestamp = now_iso()
        start_time = time.time()
        
        try:
            # Extract and validate params — one call, fail fast
            request_params = extract_from_post(self)
            base = request_params.base
            section_params = request_params.section_params
            
            # Always compute fresh — never touch cache
            sections = await fetch_all_sections(base, section_params=section_params)
            
            self._write_response(
                request_id=request_id,
                request_timestamp=request_timestamp,
                start_time=start_time,
                request_params=request_params,
                cache_hit=False,
                sections=sections,
            )
        
        except Exception:
            self._write_error_response(
                request_id=request_id,
                request_timestamp=request_timestamp,
                start_time=start_time,
                error_stack=traceback.format_exc(),
            )
    
    
    def _write_response(
        self,
        request_id: str,
        request_timestamp: str,
        start_time: float,
        request_params: RequestParams,
        cache_hit: bool,
        sections: dict,
    ):
        duration_ms = int((time.time() - start_time) * 1000)
        
        response = {
            "request_id": request_id,
            "request_timestamp": request_timestamp,
            "duration_ms": duration_ms,
            "curl_command": generate_curl_command(self.request, request_params),
            
            "request_params": request_params.base.to_dict(),
            "section_params": request_params.section_params,
            
            "cache_hit": cache_hit,
            "server_status": get_server_status(),
            
            "error": False,
            "error_stack": "",
            
            "sections": sections,
        }
        
        self.set_header("Content-Type", "application/json")
        self.set_header("X-Request-ID", request_id)
        self.write(response)
    
    
    def _write_error_response(
        self,
        request_id: str,
        request_timestamp: str,
        start_time: float,
        error_stack: str,
    ):
        duration_ms = int((time.time() - start_time) * 1000)
        
        response = {
            "request_id": request_id,
            "request_timestamp": request_timestamp,
            "duration_ms": duration_ms,
            "curl_command": None,
            
            "request_params": None,
            "section_params": None,
            
            "cache_hit": False,
            "server_status": get_server_status(),
            
            "error": True,
            "error_stack": error_stack,
            
            "sections": None,
        }
        
        self.set_status(400)
        self.set_header("Content-Type", "application/json")
        self.set_header("X-Request-ID", request_id)
        self.write(response)

orchestrator.py
python"""
THE FLOW.

Defines which sections run. They run in parallel.
Imports individual section functions from sections/*.
"""

import asyncio
from typing import Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor

from params import BaseParams
from sections.base import run_section
from sections.futures import get_futures
from sections.bonds import get_bonds
# Add more imports as you add sections

import config


executor = ThreadPoolExecutor(max_workers=10)


async def fetch_all_sections(
    params: BaseParams,
    section_params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    THE FLOW.
    
    Called by:
    - Background warmup threads (via sync wrapper)
    - POST handler
    - GET handler (on cache miss)
    
    Args:
        params: BaseParams object with all global parameters
        section_params: Optional dict of section-specific parameters
    
    Returns:
        Dict mapping section name to {data, metadata, error_stack}
    """
    section_params = section_params or {}
    
    # =========================================================================
    # DEFINE THE FLOW HERE
    # =========================================================================
    sections_to_fetch = {
        "futures": (get_futures, section_params.get("futures", {})),
        "bonds": (get_bonds, section_params.get("bonds", {})),
        # Add more:
        # "ir_delta": (get_ir_delta, section_params.get("ir_delta", {})),
        # "new_trades": (get_new_trades, section_params.get("new_trades", {})),
    }
    # =========================================================================
    
    results = {}
    futures_map = {}
    
    loop = asyncio.get_event_loop()
    
    # Submit all to executor (parallel)
    for section_name, (fetcher_fn, params_for_section) in sections_to_fetch.items():
        timeout = config.TIMEOUTS.get(section_name, config.TIMEOUTS["default"])
        future = loop.run_in_executor(
            executor,
            run_section,
            fetcher_fn,
            params,
            params_for_section,
            timeout,
        )
        futures_map[section_name] = future
    
    # Collect results
    for section_name, future in futures_map.items():
        results[section_name] = await future
    
    return results


def fetch_all_sections_sync(
    params: BaseParams,
    section_params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Synchronous wrapper for use by warmup threads.
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(fetch_all_sections(params, section_params))
    finally:
        loop.close()

sections/base.py
python"""
Base wrapper for running any section.
Handles: timing, try/catch, standardized output.
"""

import time
import traceback
from typing import Callable, Dict, Any
from datetime import datetime, timezone

from params import BaseParams


def run_section(
    fetcher_fn: Callable,
    params: BaseParams,
    section_params: Dict[str, Any],
    timeout: int,
) -> Dict[str, Any]:
    """
    Runs a fetcher function with standardized error handling and output.
    
    Args:
        fetcher_fn: The section function (get_futures, get_bonds, etc.)
        params: BaseParams object
        section_params: Section-specific parameters
        timeout: Timeout in seconds (for future implementation)
    
    Returns:
        {
            "data": <result or None>,
            "metadata": {
                "last_updated": <ISO timestamp or None>,
                "status": "ok" | "error",
                "refresh_duration_ms": <int>
            },
            "error_stack": <empty string or full traceback>
        }
    """
    start_time = time.time()
    
    try:
        data = fetcher_fn(params=params, **section_params)
        
        duration_ms = int((time.time() - start_time) * 1000)
        
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
        duration_ms = int((time.time() - start_time) * 1000)
        
        return {
            "data": None,
            "metadata": {
                "last_updated": None,
                "status": "error",
                "refresh_duration_ms": duration_ms,
            },
            "error_stack": traceback.format_exc(),
        }

sections/futures.py
python"""
Futures section fetcher.
"""

from typing import Dict, Any

from params import BaseParams


def get_futures(params: BaseParams, **section_params) -> Dict[str, Any]:
    """
    Fetch futures positions and risk.
    
    Args:
        params: BaseParams with all global parameters
        **section_params: Section-specific parameters:
            - live_price_overrides: Dict[str, float] — contract code -> price override
    
    Returns:
        Data dict for this section
    
    Raises:
        ValueError: If section_params are invalid
    """
    # === Handle section-specific params ===
    live_price_overrides = section_params.get("live_price_overrides", {})
    
    if not isinstance(live_price_overrides, dict):
        raise ValueError(
            f"live_price_overrides must be dict, got {type(live_price_overrides).__name__}"
        )
    
    # === Your implementation here ===
    # Access global params via: params.env_date, params.pos_date, params.books, etc.
    # - Query database
    # - Apply overrides
    # - Return data
    
    return {
        "placeholder": True,
        "env_date": params.env_date,
        "pos_date": params.pos_date,
        "books": params.books,
        "time_of_day": params.time_of_day,
        "overrides_applied": live_price_overrides,
    }

sections/bonds.py
python"""
Bonds section fetcher.
"""

from typing import Dict, Any, List

from params import BaseParams


def get_bonds(params: BaseParams, **section_params) -> Dict[str, Any]:
    """
    Fetch bond positions, prices, P&L.
    
    Args:
        params: BaseParams with all global parameters
        **section_params: Section-specific parameters:
            - exclude_isins: List[str] — ISINs to exclude from results
    
    Returns:
        Data dict for this section
    
    Raises:
        ValueError: If section_params are invalid
    """
    # === Handle section-specific params ===
    exclude_isins = section_params.get("exclude_isins", [])
    
    if not isinstance(exclude_isins, list):
        raise ValueError(
            f"exclude_isins must be list, got {type(exclude_isins).__name__}"
        )
    
    # === Your implementation here ===
    
    return {
        "placeholder": True,
        "env_date": params.env_date,
        "pos_date": params.pos_date,
        "books": params.books,
        "time_of_day": params.time_of_day,
        "excluded_isins": exclude_isins,
    }

scheduler.py
python"""
Warmup thread management.
"""

import time
import threading
from typing import Dict, Any
from datetime import datetime

from params import build_from_dict, BaseParams
from orchestrator import fetch_all_sections_sync
from cache import write_to_cache
import config


# Track warmup thread status for /status endpoint
_warmup_status: Dict[str, Dict[str, Any]] = {}
_warmup_status_lock = threading.Lock()

# Server status
_server_status = "warming_up"


def get_server_status() -> str:
    return _server_status


def get_warmup_status() -> Dict[str, Any]:
    with _warmup_status_lock:
        return dict(_warmup_status)


def start_all_warmup_workers():
    """Called once at server startup."""
    global _server_status
    
    for cfg in config.WARMUP_CONFIGS:
        name = cfg["name"]
        
        # Initialize status
        with _warmup_status_lock:
            _warmup_status[name] = {
                "status": "starting",
                "in_time_window": False,
                "last_run": None,
                "last_duration_ms": None,
                "last_error": None,
            }
        
        thread = threading.Thread(
            target=_warmup_worker,
            args=(cfg,),
            daemon=True,
            name=f"warmup-{name}",
        )
        thread.start()
    
    _server_status = "warmed_up"


def _warmup_worker(cfg: Dict[str, Any]):
    """
    One thread per warmup config. Runs forever.
    """
    name = cfg["name"]
    schedule = cfg["schedule"]
    interval = schedule["interval_seconds"]
    
    # Build BaseParams from config
    try:
        params = build_from_dict(cfg)
    except ValueError as e:
        with _warmup_status_lock:
            _warmup_status[name]["status"] = "config_error"
            _warmup_status[name]["last_error"] = str(e)
        return
    
    while True:
        in_window = _in_time_window(schedule["start_time"], schedule["end_time"])
        
        with _warmup_status_lock:
            _warmup_status[name]["in_time_window"] = in_window
        
        if in_window:
            start_time = time.time()
            
            with _warmup_status_lock:
                _warmup_status[name]["status"] = "running"
            
            try:
                result = fetch_all_sections_sync(params, section_params=None)
                
                cache_key = params.to_cache_key()
                write_to_cache(cache_key, result)
                
                duration_ms = int((time.time() - start_time) * 1000)
                
                with _warmup_status_lock:
                    _warmup_status[name]["status"] = "idle"
                    _warmup_status[name]["last_run"] = datetime.utcnow().isoformat() + "Z"
                    _warmup_status[name]["last_duration_ms"] = duration_ms
                    _warmup_status[name]["last_error"] = None
            
            except Exception as e:
                with _warmup_status_lock:
                    _warmup_status[name]["status"] = "error"
                    _warmup_status[name]["last_error"] = str(e)
        
        time.sleep(interval)


def _in_time_window(start_time: str, end_time: str) -> bool:
    """
    Check if current time is within the window.
    Handles overnight windows (e.g., start=22:00, end=06:00).
    
    Args:
        start_time: HH:MM format
        end_time: HH:MM format
    """
    now = datetime.now().strftime("%H:%M")
    
    if start_time <= end_time:
        # Normal window: 06:00 - 18:00
        return start_time <= now <= end_time
    else:
        # Overnight window: 22:00 - 06:00
        return now >= start_time or now <= end_time

cache.py
python"""
Cache storage with thread-safe access.
"""

import threading
from typing import Dict, Any, Optional, Tuple


_cache: Dict[Tuple, Dict[str, Any]] = {}
_cache_lock = threading.Lock()


def get_from_cache(key: tuple) -> Optional[Dict[str, Any]]:
    """
    Thread-safe cache read.
    
    Args:
        key: Cache key (tuple from BaseParams.to_cache_key())
    
    Returns:
        Cached sections dict or None if not found
    """
    with _cache_lock:
        return _cache.get(key)


def write_to_cache(key: tuple, sections: Dict[str, Any]) -> None:
    """
    Thread-safe cache write.
    
    Args:
        key: Cache key
        sections: Dict of section results
    """
    with _cache_lock:
        _cache[key] = sections


def get_cache_info() -> Dict[str, Any]:
    """
    Return cache statistics for /status endpoint.
    """
    with _cache_lock:
        keys = []
        for key in _cache.keys():
            keys.append({
                "key": str(key),
                "sections": list(_cache[key].keys()),
            })
        return {
            "size": len(_cache),
            "keys": keys,
        }

config.py
python"""
Position Environment Server Configuration
"""

from typing import List, Dict, Any


# =============================================================================
# SERVER
# =============================================================================

SERVER = {
    "host": "0.0.0.0",
    "port": 8888,
}


# =============================================================================
# TIMEOUTS (seconds) - per section
# =============================================================================

TIMEOUTS = {
    "futures": 60,
    "bonds": 60,
    "default": 60,
}


# =============================================================================
# VALIDATION
# =============================================================================

VALID_TIME_OF_DAY = ["SOD", "EOD", "LIVE"]
DATE_FORMAT = "%Y-%m-%d"


# =============================================================================
# WARMUP CONFIGS
# =============================================================================

WARMUP_CONFIGS: List[Dict[str, Any]] = [
    {
        "name": "SOD_MAIN",
        "env_date": "2025-12-16",
        "pos_date": "2025-12-15",
        "books": ["CUPS", "YCSO"],
        "time_of_day": "SOD",
        "schedule": {
            "start_time": "06:00",
            "end_time": "18:00",
            "interval_seconds": 60,
        },
    },
    {
        "name": "LIVE_EXO",
        "env_date": "2025-12-16",
        "pos_date": "2025-12-15",
        "books": ["EXO"],
        "time_of_day": "LIVE",
        "schedule": {
            "start_time": "07:00",
            "end_time": "18:00",
            "interval_seconds": 30,
        },
    },
    {
        "name": "EOD_MAIN",
        "env_date": "2025-12-16",
        "pos_date": "2025-12-15",
        "books": ["CUPS", "YCSO"],
        "time_of_day": "EOD",
        "schedule": {
            "start_time": "15:00",
            "end_time": "20:00",
            "interval_seconds": 60,
        },
    },
]

utils.py
python"""
Utility functions.
"""

import uuid
import json
from datetime import datetime, timezone
from typing import Optional

from params import RequestParams


def generate_request_id() -> str:
    """Generate a unique request ID."""
    return str(uuid.uuid4())


def now_iso() -> str:
    """Current timestamp in ISO format."""
    return datetime.now(timezone.utc).isoformat()


def generate_curl_command(request, request_params: Optional[RequestParams]) -> Optional[str]:
    """
    Generate a curl command to replay this request.
    
    Args:
        request: Tornado HTTPServerRequest
        request_params: Parsed RequestParams (None if parsing failed)
    
    Returns:
        curl command string, or None if params not available
    """
    if request_params is None:
        return None
    
    base_url = f"{request.protocol}://{request.host}{request.path}"
    
    if request.method == "GET":
        params = request_params.base.to_dict()
        # Convert books list to comma-separated for query string
        params["books"] = ",".join(params["books"])
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        return f"curl -X GET '{base_url}?{query_string}'"
    
    elif request.method == "POST":
        body = request_params.base.to_dict()
        if request_params.section_params:
            body["section_params"] = request_params.section_params
        body_json = json.dumps(body)
        return f"curl -X POST '{base_url}' -H 'Content-Type: application/json' -d '{body_json}'"
    
    return None

server.py
python"""
Tornado application setup.
"""

from tornado.web import Application
from tornado.ioloop import IOLoop

from handlers.position_environment import PositionEnvironmentHandler
from handlers.status import StatusHandler
from scheduler import start_all_warmup_workers
import config


def make_app() -> Application:
    return Application([
        (r"/position-environment", PositionEnvironmentHandler),
        (r"/status", StatusHandler),
    ])


def main():
    app = make_app()
    app.listen(config.SERVER["port"], config.SERVER["host"])
    
    print(f"Starting server on {config.SERVER['host']}:{config.SERVER['port']}")
    
    start_all_warmup_workers()
    
    IOLoop.current().start()


if __name__ == "__main__":
    main()

handlers/status.py
python"""
Handler for /status endpoint.
"""

from tornado.web import RequestHandler

from scheduler import get_server_status, get_warmup_status
from cache import get_cache_info


class StatusHandler(RequestHandler):
    
    def get(self):
        response = {
            "server_status": get_server_status(),
            "warmup_threads": get_warmup_status(),
            "cache": get_cache_info(),
        }
        
        self.set_header("Content-Type", "application/json")
        self.write(response)

Summary: What Changed From v1
Aspectv1v2Parameter handlingScattered across handler + validation.pyCentralized in params.pyGlobal paramsPassed as separate argsBaseParams objectAdding a global paramTouch 10+ filesTouch 1 file (params.py)Cache key generationIn cache.pyOn BaseParams.to_cache_key()SectionsAll in fetchers.pyEach in sections/*.pyFlow definitionMixed with fetchersClean in orchestrator.py

Quick Reference: Adding Things
Add a global parameter

Add to PARAM_DEFINITIONS in params.py
Add field to BaseParams dataclass
Add to to_cache_key() if it affects caching
Add validation in _validate_field()

Add a new section

Create sections/new_section.py with def get_new_section(params: BaseParams, **section_params)
Import in orchestrator.py
Add to sections_to_fetch dict in fetch_all_sections()
Optionally add timeout in config.py

Add a warmup config

Add dict to WARMUP_CONFIGS in config.py