import os
from django.conf import settings

LOG_FILE_PATH = getattr(
    settings, "LOG_FILE_PATH", os.path.join(settings.BASE_DIR.parent, "app.log")
)


LOGS_DIR = os.path.dirname(LOG_FILE_PATH)
if LOGS_DIR:
    os.makedirs(LOGS_DIR, exist_ok=True)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[%(asctime)s] %(levelname)s [%(name)s] %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        "file": {
            "class": "logging.FileHandler",
            "filename": LOG_FILE_PATH,
            "formatter": "verbose",
            "encoding": "utf-8",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": True,
        },
        "core": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": True,
        },
    },
}
