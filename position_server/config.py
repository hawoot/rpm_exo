"""
Position Environment Server Configuration
"""

# Server
SERVER = {
    "host": "0.0.0.0",
    "port": 8888,
}

# Date format for validation
DATE_FORMAT = "%Y%m%d"

# Timeouts per section (seconds)
TIMEOUTS = {
    "futures": 60,
    "bonds": 60,
    "default": 60,
}

# Warmup configurations
# Format preserved for future external loading
WARMUP_CONFIGS = [
    {
        "name": "SOD_MAIN",
        "env_date": "20251216",
        "pos_date": "20251215",
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
        "env_date": "20251216",
        "pos_date": "20251215",
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
        "env_date": "20251216",
        "pos_date": "20251215",
        "books": ["CUPS", "YCSO"],
        "time_of_day": "EOD",
        "schedule": {
            "start_time": "15:00",
            "end_time": "20:00",
            "interval_seconds": 60,
        },
    },
]
