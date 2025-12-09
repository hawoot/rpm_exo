"""
Base handler with common functionality.
"""
import json
from typing import Any

from tornado.web import RequestHandler


class BaseHandler(RequestHandler):
    """Base handler with common error handling and response methods."""

    def set_default_headers(self) -> None:
        """Set default headers for all responses."""
        self.set_header("Content-Type", "application/json")

    def write_response(self, data: dict[str, Any]) -> None:
        """Write a JSON response."""
        self.write(json.dumps(data, indent=2))

    def parse_get_params(self) -> dict[str, Any]:
        """
        Parse GET query parameters into request_data format.
        Returns raw strings - no type conversion.
        """
        query_params = {}
        for key in self.request.arguments:
            # Get the last value for each key (in case of duplicates)
            value = self.get_argument(key)
            query_params[key] = value

        return {
            "method": "GET",
            "query_params": query_params,
        }

    def parse_post_body(self) -> dict[str, Any]:
        """
        Parse POST JSON body into request_data format.
        """
        try:
            body = json.loads(self.request.body)
        except (json.JSONDecodeError, TypeError):
            body = {}

        return {
            "method": "POST",
            "body": body,
        }
