import os
import sys
from pathlib import Path

from django.core.management import execute_from_command_line


if __name__ == "__main__":
    root_dir = Path(__file__).resolve().parent
    backend_dir = root_dir / "backend"
    sys.path.insert(0, str(backend_dir))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    execute_from_command_line([sys.argv[0], "seed_demo", *sys.argv[1:]])
