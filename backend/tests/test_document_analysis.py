from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.routers import documents
from app.routers.documents import analyze_document
from app.schemas import AnalyzeRequest
from app.services.ai.rule_based import RuleBasedProvider
from app.services.document_extraction import DocumentExtractionError
from app.services.document_service import basic_analysis


class FakeDatabase:
    def __init__(self, uploaded_file=None) -> None:
        self.uploaded_file = uploaded_file
        self.added: list[object] = []

    async def get(self, _model, _file_id):
        return self.uploaded_file

    def add(self, obj) -> None:
        self.added.append(obj)

    async def flush(self) -> None:
        return None


@pytest.mark.asyncio
async def test_unreadable_uploaded_file_still_saves_a_basic_record(monkeypatch) -> None:
    """An unreadable upload must never dead-end the client: when text extraction
    fails and no vision model is reachable, a basic rule-based record is saved so
    the reader still gets a document to open (see analyze_document)."""
    user = SimpleNamespace(id="user-1")
    uploaded = SimpleNamespace(
        user_id=user.id,
        storage_path="local/user-1/file.pdf",
        mime_type="application/pdf",
        name="file.pdf",
        document_id=None,
    )

    async def download(_path: str) -> bytes:
        return b"not-a-pdf"

    def fail_extraction(*_args: object) -> str:
        raise DocumentExtractionError("This PDF could not be read.")

    # Rule-based provider has no vision path, so the fallback branch is taken
    # deterministically without any network call.
    monkeypatch.setattr(documents.storage, "download", download)
    monkeypatch.setattr(documents, "extract_text", fail_extraction)
    monkeypatch.setattr(documents, "get_provider", lambda: RuleBasedProvider())

    db = FakeDatabase(uploaded)
    result = await analyze_document(AnalyzeRequest(fileId="file-1"), db, user)

    # A document was returned (not an error) and persisted, rather than the
    # client being left with a 422 dead-end.
    assert isinstance(result, dict)
    assert result.get("id")
    assert result.get("title")
    assert len(db.added) == 1


@pytest.mark.asyncio
async def test_unknown_uploaded_file_returns_404() -> None:
    user = SimpleNamespace(id="user-1")

    with pytest.raises(HTTPException) as error:
        await analyze_document(AnalyzeRequest(fileId="missing"), FakeDatabase(), user)

    assert error.value.status_code == 404


def test_residence_certificate_gets_complete_offline_details() -> None:
    analysis = basic_analysis(
        "Government of Telangana Residence Certificate. Verify at https://tg.meeseva.gov.in/",
        "certificate.pdf",
    )

    assert analysis["title"]["en"] == "Residence Certificate"
    assert analysis["why"]["en"]
    assert analysis["where"]["en"]
    assert len(analysis["steps"]) == 2
    assert len(analysis["need"]) == 2
