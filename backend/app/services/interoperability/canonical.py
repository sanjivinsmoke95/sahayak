"""The canonical citizen-data representation and small helpers around it.

One shape flows through the whole layer so the core never has to know five
departmental formats:

    address -> {"line1": str, "city": str, "state": str, "pincode": str}
    phone   -> str  (digits, optionally with country code)
"""

from typing import Any

ADDRESS_KEYS = ("line1", "city", "state", "pincode")


def normalise_address(value: Any) -> dict[str, str]:
    """Coerce anything address-shaped into the canonical dict with all keys."""
    value = value or {}
    if not isinstance(value, dict):
        return {key: "" for key in ADDRESS_KEYS}
    return {key: str(value.get(key, "") or "").strip() for key in ADDRESS_KEYS}


def address_summary(value: Any) -> str:
    """A one-line human form, e.g. 'Hyderabad, Telangana 500020'."""
    addr = normalise_address(value)
    city_state = ", ".join(p for p in (addr["city"], addr["state"]) if p)
    tail = " ".join(p for p in (city_state, addr["pincode"]) if p)
    return tail or addr["line1"] or "—"


def normalise_phone(value: Any) -> str:
    return str(value or "").strip()


def mask_phone(phone: Any) -> str:
    """Keep the first two and last two digits; hide the middle.

    Used wherever a phone number is stored for audit/history or written to a
    log — the real number only ever lives in the citizen's own profile and is
    handed to the connectors in memory.
    """
    digits = [c for c in str(phone or "") if c.isdigit()]
    if len(digits) < 4:
        return "•" * len(digits)
    hidden = "X" * (len(digits) - 4)
    return "".join(digits[:2]) + hidden + "".join(digits[-2:])


def stored_value(field: str, value: Any) -> Any:
    """The form kept in the audit record: address in full, phone masked."""
    if field == "phone":
        return mask_phone(value)
    return normalise_address(value)
