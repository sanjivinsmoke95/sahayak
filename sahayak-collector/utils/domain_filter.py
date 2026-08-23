"""
Official-government domain gatekeeper.

The crawler MUST only ever fetch official government domains. This module is the
single authority for that decision and is used both by Scrapy's allowed_domains
and by an explicit check in the spider before yielding a request.
"""
from __future__ import annotations

from pathlib import Path

import tldextract
import yaml

# Use the bundled Public Suffix List snapshot (no network calls at runtime).
_EXTRACT = tldextract.TLDExtract(suffix_list_urls=())

from config.settings import PROJECT_ROOT

_SOURCES_FILE = PROJECT_ROOT / "config" / "sources.yaml"


def _load_trust_config() -> tuple[tuple[str, ...], frozenset[str]]:
    with open(_SOURCES_FILE, "r", encoding="utf-8") as fh:
        data = yaml.safe_load(fh)
    suffixes = tuple(data.get("trusted_suffixes", (".gov.in", ".nic.in")))
    domains = frozenset(d.lower() for d in data.get("trusted_domains", ()))
    return suffixes, domains


_TRUSTED_SUFFIXES, _TRUSTED_DOMAINS = _load_trust_config()


def is_government_url(url: str) -> bool:
    """
    True only for official government domains:
      * any host ending in a trusted suffix (.gov.in / .nic.in), or
      * an explicitly whitelisted recognised gov portal.
    """
    if not url or not url.startswith(("http://", "https://")):
        return False

    ext = _EXTRACT(url)
    host = ".".join(p for p in (ext.subdomain, ext.domain, ext.suffix) if p).lower()

    if host in _TRUSTED_DOMAINS:
        return True
    return any(host.endswith(suffix.lstrip("*")) for suffix in _TRUSTED_SUFFIXES)


def registrable_domain(url: str) -> str:
    ext = _EXTRACT(url)
    return ".".join(p for p in (ext.domain, ext.suffix) if p).lower()
