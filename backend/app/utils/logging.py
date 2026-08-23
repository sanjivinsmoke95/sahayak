import logging
import sys

from app.config import settings


def configure_logging() -> None:
    """Plain, greppable logs. Structured output can be layered on later."""
    level = logging.DEBUG if settings.environment == "development" else logging.INFO
    logging.basicConfig(
        level=level,
        stream=sys.stdout,
        format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
    )
    logging.getLogger("httpx").setLevel(logging.WARNING)
