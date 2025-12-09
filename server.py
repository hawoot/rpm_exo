"""
Tornado API server entry point.
"""
import asyncio

from tornado.web import Application
from tornado.ioloop import IOLoop

from config import SERVER_PORT
from handlers import PosEnvHandler


def create_app() -> Application:
    """Create and configure the Tornado application."""
    return Application([
        (r"/pos_env", PosEnvHandler),
    ])


def main() -> None:
    """Start the server."""
    app = create_app()
    app.listen(SERVER_PORT)
    print(f"Server running on http://localhost:{SERVER_PORT}")
    print(f"Endpoints:")
    print(f"  GET  /pos_env - Cacheable request with shared params")
    print(f"  POST /pos_env - Non-cached request with nested section params")
    IOLoop.current().start()


if __name__ == "__main__":
    main()
