"""Government interoperability layer (SIH26129).

The public surface is small on purpose:

  - ``canonical``       — the one citizen-data representation used end to end
  - ``connectors``      — one connector per government system, one wire contract
  - ``citizen_profile`` — read/write the canonical profile, seed mock systems
  - ``sync_service``    — orchestrate consent -> connectors -> results -> audit
"""

from app.services.interoperability import (
    canonical,
    citizen_profile,
    connectors,
    sync_service,
)

__all__ = ["canonical", "citizen_profile", "connectors", "sync_service"]
