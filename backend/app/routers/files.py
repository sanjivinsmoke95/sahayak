from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status
from fastapi import File as FastAPIFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import File, User
from app.schemas import FileRead
from app.services.storage import storage

router = APIRouter(prefix="/files", tags=["files"])


def _to_api(record: File, url: str | None = None) -> FileRead:
    return FileRead(
        id=record.id,
        documentId=record.document_id,
        name=record.name,
        mimeType=record.mime_type,
        sizeBytes=record.size_bytes,
        originalSizeBytes=record.original_size_bytes,
        storagePath=record.storage_path,
        url=url,
        createdAt=record.created_at,
    )


@router.get("", response_model=list[FileRead])
async def list_files(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[FileRead]:
    result = await db.execute(
        select(File).where(File.user_id == user.id).order_by(File.created_at.desc())
    )
    return [_to_api(record) for record in result.scalars().all()]


@router.post("", response_model=FileRead, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    original_size_bytes: int | None = Form(default=None),
    document_id: str | None = Form(default=None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> FileRead:
    """
    Stores an already-compressed upload.

    Compression happens on the phone before this is called, which is both
    faster for the user and means the full-size original never leaves the
    device. `original_size_bytes` is what it weighed before that.
    """
    content = await file.read()
    path = storage.build_path(user.id, file.filename or "upload.bin")

    path = await storage.upload(path, content, file.content_type)

    record = File(
        user_id=user.id,
        document_id=document_id,
        name=file.filename or "upload.bin",
        mime_type=file.content_type or "application/octet-stream",
        size_bytes=len(content),
        original_size_bytes=original_size_bytes,
        storage_path=path,
    )
    db.add(record)
    await db.flush()

    url = await storage.signed_url(path) if storage.enabled else None
    return _to_api(record, url)


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    result = await db.execute(select(File).where(File.id == file_id, File.user_id == user.id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File not found")

    await storage.delete(record.storage_path)
    await db.delete(record)
