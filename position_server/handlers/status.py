"""
Status endpoint handler.
"""

from tornado.web import RequestHandler

from ..scheduler import get_server_status, get_warmup_status
from ..cache import get_cache_info


class StatusHandler(RequestHandler):

    def get(self):
        response = {
            "server_status": get_server_status(),
            "warmup_threads": get_warmup_status(),
            "cache": get_cache_info(),
        }
        self.set_header("Content-Type", "application/json")
        self.write(response)
