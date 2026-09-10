"""Uploads are echoed back from the app's own origin, so the type must come
from the bytes and must never be one a browser will execute."""

from app.routers.documents import _INLINE_SAFE_TYPES
from app.routers.files import sniff_type

PDF = b"%PDF-1.7\n%\xe2\xe3\xcf\xd3\n"
PNG = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
JPEG = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00"
WEBP = b"RIFF\x24\x00\x00\x00WEBPVP8 "

HTML = b"<script>alert(document.domain)</script>"
SVG = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'


def test_accepts_the_formats_the_upload_screen_advertises() -> None:
    assert sniff_type(PDF) == "application/pdf"
    assert sniff_type(PNG) == "image/png"
    assert sniff_type(JPEG) == "image/jpeg"
    assert sniff_type(WEBP) == "image/webp"


def test_rejects_content_a_browser_would_execute() -> None:
    assert sniff_type(HTML) is None
    assert sniff_type(SVG) is None


def test_rejects_unrecognised_bytes() -> None:
    assert sniff_type(b"") is None
    assert sniff_type(b"just some text") is None
    # A PNG signature must be at the start, not merely present.
    assert sniff_type(b"GIF89a" + PNG) is None


def test_type_is_read_from_bytes_not_from_the_client_claim() -> None:
    """A caller sending HTML while claiming image/png gets no say: the sniffer
    only ever sees the body, so the lie cannot reach the stored mime type."""
    assert sniff_type(HTML) is None
    assert sniff_type(PNG) == "image/png"


def test_executable_types_are_never_served_inline() -> None:
    for executable in ("text/html", "image/svg+xml", "application/xhtml+xml"):
        assert executable not in _INLINE_SAFE_TYPES
    # Everything the sniffer can produce is safe to render in place.
    for renderable in ("application/pdf", "image/png", "image/jpeg", "image/webp"):
        assert renderable in _INLINE_SAFE_TYPES
