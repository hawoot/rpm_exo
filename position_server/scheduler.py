"""
Warmup thread management.
"""

import time
import threading
from typing import Dict, Any
from datetime import datetime

from .params import build_from_dict
from .orchestrator import fetch_all_sections_sync
from .cache import write_to_cache
from . import config


_warmup_status: Dict[str, Dict[str, Any]] = {}
_warmup_status_lock = threading.Lock()
_server_status = "starting"


def get_server_status() -> str:
    return _server_status


def get_warmup_status() -> Dict[str, Any]:
    with _warmup_status_lock:
        return dict(_warmup_status)


def start_all_warmup_workers():
    """Start all warmup threads. Called once at server startup."""
    global _server_status

    for cfg in config.WARMUP_CONFIGS:
        name = cfg["name"]

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

    _server_status = "running"


def _warmup_worker(cfg: Dict[str, Any]):
    """Worker loop for one warmup config."""
    name = cfg["name"]
    schedule = cfg["schedule"]
    interval = schedule["interval_seconds"]

    # Build params from config
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
            start = time.time()

            with _warmup_status_lock:
                _warmup_status[name]["status"] = "running"

            try:
                result = fetch_all_sections_sync(params)
                write_to_cache(params.to_cache_key(), result)
                duration_ms = int((time.time() - start) * 1000)

                with _warmup_status_lock:
                    _warmup_status[name]["status"] = "idle"
                    _warmup_status[name]["last_run"] = datetime.utcnow().isoformat() + "Z"
                    _warmup_status[name]["last_duration_ms"] = duration_ms
                    _warmup_status[name]["last_error"] = None

            except Exception as e:
                with _warmup_status_lock:
                    _warmup_status[name]["status"] = "error"
                    _warmup_status[name]["last_error"] = str(e)
        else:
            with _warmup_status_lock:
                _warmup_status[name]["status"] = "outside_window"

        time.sleep(interval)


def _in_time_window(start_time: str, end_time: str) -> bool:
    """Check if current time is in window. Handles overnight windows."""
    now = datetime.now().strftime("%H:%M")

    if start_time <= end_time:
        return start_time <= now <= end_time
    else:
        # Overnight: e.g., 22:00 - 06:00
        return now >= start_time or now <= end_time
