import logging
import re
import sys

from app.config import settings

# Anything shaped like an identity number is scrubbed on its way to a handler,
# wherever it came from — our own code, a traceback, a third-party library, or
# a driver echoing a failed statement.
_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = (
    # Aadhaar: 12 digits, optionally spaced or hyphenated in groups of four.
    (re.compile(r"\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b"), "[AADHAAR REDACTED]"),
    # PAN.
    (re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"), "[PAN REDACTED]"),
    # Bearer tokens and any key material that reaches a log line.
    (re.compile(r"(?i)\b(bearer\s+)[A-Za-z0-9._~+/-]{16,}=*"), r"\1[TOKEN REDACTED]"),
    (
        re.compile(r"(?i)\b(api[_-]?key|secret|password|token)\b(\s*[:=]\s*)\S+"),
        r"\1\2[REDACTED]",
    ),
)


def scrub(text: str) -> str:
    for pattern, replacement in _PATTERNS:
        text = pattern.sub(replacement, text)
    return text


class RedactingFilter(logging.Filter):
    """Last line of defence against an identity number reaching a log.

    The application is written not to log these values at all; this exists for
    everything that is not the application — an ORM error quoting a parameter,
    a traceback carrying a local variable, a dependency's debug output.
    """

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = scrub(record.msg)
        if record.args:
            if isinstance(record.args, dict):
                record.args = {
                    key: scrub(value) if isinstance(value, str) else value
                    for key, value in record.args.items()
                }
            else:
                record.args = tuple(
                    scrub(value) if isinstance(value, str) else value for value in record.args
                )
        # Formatted exception text is scrubbed by the formatter below.
        return True


class RedactingFormatter(logging.Formatter):
    """Scrubs the fully rendered line, tracebacks included."""

    def format(self, record: logging.LogRecord) -> str:
        return scrub(super().format(record))


def configure_logging() -> None:
    """Plain, greppable logs. Structured output can be layered on later."""
    level = logging.DEBUG if settings.environment == "development" else logging.INFO
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        RedactingFormatter("%(asctime)s %(levelname)-8s %(name)s: %(message)s")
    )
    handler.addFilter(RedactingFilter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)

    logging.getLogger("httpx").setLevel(logging.WARNING)
    # Echoed SQL would carry bound parameters straight past the app's own care.
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
