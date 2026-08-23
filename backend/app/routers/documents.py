import httpx
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import File, User
from app.schemas import AnalyzeRequest, ChecklistToggle, ReminderToggle
from app.services import document_service as docs
from app.services import profile_service as profiles
from app.services.ai import RuleBasedProvider, get_provider
from app.services.document_extraction import DocumentExtractionError, extract_text
from app.services.storage import storage

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("")
async def list_documents(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[dict]:
    await docs.ensure_seeded(db, user)
    documents = await docs.get_user_documents(db, user)
    tags = docs.detected_tags(documents)
    assignments = await profiles.assignments_map(db, user)
    result = []
    for d in documents:
        payload = docs.to_api(d, tags=tags)
        payload["profileId"] = assignments.get(d.slug)
        result.append(payload)
    return result


# Declared before /{slug} so "checklists" is never read as a document id.
@router.get("/checklists")
async def get_checklists(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    return docs.build_checklist_map(await docs.get_user_documents(db, user))


@router.patch("/checklists")
async def toggle_checklist_item(
    payload: ChecklistToggle,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    # Required documents are matched from real uploads, never hand-ticked. Only
    # the action steps can be toggled by the reader.
    if payload.kind == "need":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Required documents are ticked automatically when you upload them.",
        )

    document = await docs.get_document_by_slug(db, user, payload.documentId)
    if not document:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")

    # JSONB columns need a new object for SQLAlchemy to notice the change.
    checklist = dict(document.checklist or {})
    branch = dict(checklist.get(payload.kind, {}))
    branch[str(payload.index)] = payload.done
    checklist[payload.kind] = branch
    document.checklist = checklist

    await db.flush()
    return docs.build_checklist_map(await docs.get_user_documents(db, user))


@router.patch("/reminders")
async def toggle_reminder(
    payload: ReminderToggle,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, bool]:
    document = await docs.get_document_by_slug(db, user, payload.documentId)
    if not document:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")

    document.reminder_enabled = payload.enabled
    await db.flush()

    all_documents = await docs.get_user_documents(db, user)
    return {d.slug: d.reminder_enabled for d in all_documents}


@router.post("/analyze", status_code=status.HTTP_201_CREATED)
async def analyze_document(
    payload: AnalyzeRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """
    Adds a document to the account.

    A sampleId adds a bundled demo notice. A real file is read, analysed when
    an AI provider is configured, and otherwise saved with its extracted text
    so the reader can still open it and ask grounded questions.
    """
    if payload.fileId:
        uploaded = await db.get(File, payload.fileId)
        if not uploaded or uploaded.user_id != user.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Uploaded file not found")
        try:
            raw_text = extract_text(
                await storage.download(uploaded.storage_path), uploaded.mime_type, uploaded.name
            )
        except FileNotFoundError as exc:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
        except httpx.HTTPError as exc:
            raise HTTPException(
                status.HTTP_502_BAD_GATEWAY,
                "The uploaded certificate could not be retrieved from storage. "
                "Please try uploading it again.",
            ) from exc
        except DocumentExtractionError as exc:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc

        provider = get_provider()
        analysis = docs.basic_analysis(raw_text, uploaded.name)
        if not isinstance(provider, RuleBasedProvider):
            try:
                analysis = await provider.analyze_document(raw_text, uploaded.name)
            except Exception as exc:
                raise HTTPException(
                    status.HTTP_502_BAD_GATEWAY,
                    "The document text was read, but the analysis service is unavailable. "
                    "Please try again.",
                ) from exc

        document = docs.from_analysis(analysis, user.id, raw_text, uploaded.name)
        db.add(document)
        await db.flush()
        uploaded.document_id = document.id
        return docs.to_api(document)

    if not payload.sampleId:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "Choose a sample document or upload a file to analyse.",
        )

    document = await docs.add_sample(db, user, payload.sampleId)
    if not document:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown document")
    return docs.to_api(document)


@router.get("/{slug}")
async def get_document(
    slug: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    document = await docs.get_document_by_slug(db, user, slug)
    if not document:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    tags = docs.detected_tags(await docs.get_user_documents(db, user))
    payload = docs.to_api(document, detailed=True, tags=tags)

    # Attach the original uploaded file's name/type so the UI can offer view,
    # share and download without exposing storage internals.
    result = await db.execute(
        select(File)
        .where(File.document_id == document.id)
        .order_by(File.created_at.desc())
        .limit(1)
    )
    original = result.scalar_one_or_none()
    payload["originalFile"] = (
        {"name": original.name, "mime": original.mime_type} if original else None
    )
    assignments = await profiles.assignments_map(db, user)
    payload["profileId"] = assignments.get(document.slug)
    return payload


@router.get("/{slug}/file")
async def get_document_file(
    slug: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Response:
    """Stream the original uploaded PDF/image so the reader can view or save it."""
    document = await docs.get_document_by_slug(db, user, slug)
    if not document:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")

    result = await db.execute(
        select(File)
        .where(File.document_id == document.id)
        .order_by(File.created_at.desc())
        .limit(1)
    )
    file = result.scalar_one_or_none()
    if not file:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No original file for this document")

    try:
        content = await storage.download(file.storage_path)
    except FileNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "The original file is no longer available.") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY, "The original file could not be retrieved."
        ) from exc

    safe_name = file.name.replace('"', "").replace("\n", " ")
    return Response(
        content=content,
        media_type=file.mime_type or "application/octet-stream",
        headers={"Content-Disposition": f'inline; filename="{safe_name}"'},
    )


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    slug: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    document = await docs.get_document_by_slug(db, user, slug)
    if document:
        await db.delete(document)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_documents(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    for document in await docs.get_user_documents(db, user):
        await db.delete(document)
