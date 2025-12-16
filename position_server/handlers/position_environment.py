"""
Position environment endpoint handler.
"""

import time
import traceback
from tornado.web import RequestHandler

from ..params import extract_from_get, extract_from_post, BaseParams
from ..orchestrator import fetch_all_sections
from ..cache import get_from_cache, write_to_cache
from ..utils import generate_request_id, now_iso, generate_curl_command
from ..scheduler import get_server_status


class PositionEnvironmentHandler(RequestHandler):

    async def get(self):
        request_id = generate_request_id()
        request_timestamp = now_iso()
        start = time.time()

        try:
            params = extract_from_get(self)
            cache_key = params.to_cache_key()
            cached = get_from_cache(cache_key)

            if cached is not None:
                self._write_response(
                    request_id, request_timestamp, start,
                    params, None, True, cached
                )
            else:
                sections = await fetch_all_sections(params)
                write_to_cache(cache_key, sections)
                self._write_response(
                    request_id, request_timestamp, start,
                    params, None, False, sections
                )

        except Exception:
            self._write_error(request_id, request_timestamp, start, traceback.format_exc())

    async def post(self):
        request_id = generate_request_id()
        request_timestamp = now_iso()
        start = time.time()

        try:
            params, section_params = extract_from_post(self)
            sections = await fetch_all_sections(params, section_params)
            self._write_response(
                request_id, request_timestamp, start,
                params, section_params, False, sections
            )

        except Exception:
            self._write_error(request_id, request_timestamp, start, traceback.format_exc())

    def _write_response(
        self,
        request_id: str,
        request_timestamp: str,
        start: float,
        params: BaseParams,
        section_params,
        cache_hit: bool,
        sections: dict,
    ):
        duration_ms = int((time.time() - start) * 1000)

        response = {
            "request_id": request_id,
            "request_timestamp": request_timestamp,
            "duration_ms": duration_ms,
            "curl_command": generate_curl_command(self.request, params, section_params),
            "request_params": params.to_dict(),
            "section_params": section_params,
            "cache_hit": cache_hit,
            "server_status": get_server_status(),
            "error": False,
            "error_stack": "",
            "sections": sections,
        }

        self.set_header("Content-Type", "application/json")
        self.set_header("X-Request-ID", request_id)
        self.write(response)

    def _write_error(
        self,
        request_id: str,
        request_timestamp: str,
        start: float,
        error_stack: str,
    ):
        duration_ms = int((time.time() - start) * 1000)

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
