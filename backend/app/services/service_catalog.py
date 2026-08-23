"""
Server-side catalogue of government-service requirements.

This mirrors the ids of the frontend service directory (lib/data/gov-services)
but carries only what the *matching* logic needs: for each required paper, the
document tags that satisfy it. The frontend keeps the trilingual display copy;
requirements here are aligned by index, so the readiness engine can return a
status per requirement and the UI renders it with its own localized label.

Requirements with no tags (e.g. "Age proof", "Filled renewal form") cannot be
auto-detected from an uploaded document; the engine reports them as UNKNOWN
rather than pretending they are satisfied or missing.
"""

from typing import TypedDict


class Requirement(TypedDict):
    label: str  # English, for reasons/logging only; UI uses its own catalogue
    tags: list[str]


class ServiceEntry(TypedDict):
    requirements: list[Requirement]


def _req(label: str, tags: list[str]) -> Requirement:
    return {"label": label, "tags": tags}


SERVICES: dict[str, ServiceEntry] = {
    "pension-registration": {
        "requirements": [
            _req("Aadhaar card", ["aadhaar", "aadhar"]),
            _req("Bank account details", ["bank", "passbook"]),
            _req("Age proof", []),
            _req("Passport size photo", []),
        ]
    },
    "pension-renewal": {
        "requirements": [
            _req("Life certificate", ["life certificate", "jeevan"]),
            _req("Aadhaar card", ["aadhaar", "aadhar"]),
            _req("Bank passbook", ["bank", "passbook"]),
            _req("Filled renewal form", []),
        ]
    },
    "income-certificate": {
        "requirements": [
            _req("Aadhaar card", ["aadhaar", "aadhar"]),
            _req("Ration card", ["ration"]),
            _req("Proof of income", ["income"]),
            _req("Address proof", ["residence", "domicile"]),
        ]
    },
    "caste-certificate": {
        "requirements": [
            _req("Aadhaar card", ["aadhaar", "aadhar"]),
            _req("Ration card", ["ration"]),
            _req("Parent's caste certificate", ["caste", "community"]),
            _req("Address proof", ["residence", "domicile"]),
        ]
    },
    "residence-certificate": {
        "requirements": [
            _req("Aadhaar card", ["aadhaar", "aadhar"]),
            _req("Ration card", ["ration"]),
            _req("Electricity or water bill", []),
            _req("Address proof", ["residence", "domicile"]),
        ]
    },
}


def get_service(service_id: str) -> ServiceEntry | None:
    return SERVICES.get(service_id)
