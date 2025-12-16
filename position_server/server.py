"""
Tornado server setup and entry point.
"""

from tornado.web import Application
from tornado.ioloop import IOLoop

from .handlers.position_environment import PositionEnvironmentHandler
from .handlers.status import StatusHandler
from .scheduler import start_all_warmup_workers
from . import config


def make_app() -> Application:
    return Application([
        (r"/position-environment", PositionEnvironmentHandler),
        (r"/status", StatusHandler),
    ])


def main():
    app = make_app()
    app.listen(config.SERVER["port"], config.SERVER["host"])

    print(f"Server starting on {config.SERVER['host']}:{config.SERVER['port']}")

    start_all_warmup_workers()

    print("Warmup threads started. Server running.")

    IOLoop.current().start()


if __name__ == "__main__":
    main()
