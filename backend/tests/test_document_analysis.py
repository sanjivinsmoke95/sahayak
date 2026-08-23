from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.routers import documents
from app.routers.documents import analyze_document
from app.schemas import AnalyzeRequest
from app.services.document_extraction import DocumentExtractionError
from app.services.document_service import basic_analysis


class FakeDatabase:
    def __init__(self, uploaded_file=None) -> None:
        self.uploaded_file = uploaded_file

    async def get(self, _model, _file_id):
        return self.uploaded_file


@pytest.mark.asyncio
async def test_unreadable_uploaded_file_returns_clear_422(monkeypatch) -> None:
    user = SimpleNamespace(id="user-1")
    uploaded = SimpleNamespace(
        user_id=user.id,
        storage_path="local/user-1/file.pdf",
        mime_type="application/pdf",
        name="file.pdf",
    )

    async def download(_path: str) -> bytes:
        return b"not-a-pdf"

    def fail_extraction(*_args: object) -> str:
        raise DocumentExtractionError("This PDF could not be read.")

    monkeypatch.setattr(documents.storage, "download", download)
    monkeypatch.setattr(documents, "extract_text", fail_extraction)

    with pytest.raises(HTTPException) as error:
        await analyze_document(AnalyzeRequest(fileId="file-1"), FakeDatabase(uploaded), user)

    assert error.value.status_code == 422
    assert "could not be read" in error.value.detail


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
