"""
Configuration constants - single source of truth for all settings.
"""

# Date format for pos_date and env_date
DATE_FORMAT = "%Y%m%d"

# Valid values for time_of_day parameter
TIME_OF_DAY_VALUES = ["Live", "Open", "Close"]

# Available sections (will be populated by registry)
VALID_SECTIONS = ["futures", "bonds", "ir_delta", "new_trades"]

# Cache TTL settings (seconds)
DEFAULT_CACHE_TTL = 60

SECTION_TTL = {
    "futures": 60,
    "bonds": 60,
    "ir_delta": 60,
    "new_trades": 30,  # more volatile
}

# Storage settings
REQUEST_STORAGE_DIR = "logs/requests"

# Server settings
SERVER_PORT = 8888
