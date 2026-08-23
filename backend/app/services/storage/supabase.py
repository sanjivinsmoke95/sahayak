"""
Supabase Storage, over its REST API.

A thin httpx wrapper rather than the SDK: three calls are all we need, and it
keeps the dependency list short enough to audit.
"""

import mimetypes
from contextlib import suppress
from pathlib import Path
from uuid import uuid4

import httpx

from app.config import settings


class SupabaseStorage:
    def __init__(self) -> None:
        self.base_url = settings.supabase_url.rstrip("/")
        self.key = settings.supabase_service_key
        self.bucket = settings.supabase_bucket

    @property
    def enabled(self) -> bool:
        return settings.storage_enabled

    def _headers(self, content_type: str | None = None) -> dict[str, str]:
        headers = {
            "Authorization": f"Bearer {self.key}",
            "apikey": self.key,
        }
        if content_type:
            headers["Content-Type"] = content_type
        return headers

    def build_path(self, user_id: str, filename: str) -> str:
        """Files are namespaced per user so one bucket policy covers everyone."""
        suffix = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
        return f"{user_id}/{uuid4()}.{suffix}"

    def _local_path(self, path: str) -> Path:
        """Resolve a local storage path without permitting path traversal."""
        root = Path(settings.local_upload_dir).resolve()
        relative = path.removeprefix("local/")
        candidate = (root / relative).resolve()
        if root != candidate and root not in candidate.parents:
            raise ValueError("Invalid local storage path")
        return candidate

    async def upload(self, path: str, content: bytes, content_type: str | None = None) -> str:
        if not self.enabled:
            local_path = self._local_path(path)
            local_path.parent.mkdir(parents=True, exist_ok=True)
            local_path.write_bytes(content)
            return f"local/{path}"

        guessed = content_type or mimetypes.guess_type(path)[0] or "application/octet-stream"
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{self.base_url}/storage/v1/object/{self.bucket}/{path}",
                headers=self._headers(guessed),
                content=content,
            )
            response.raise_for_status()
        return path

    async def download(self, path: str) -> bytes:
        """Return upload bytes from either private Supabase or local development storage."""
        if not self.enabled:
            try:
                return self._local_path(path).read_bytes()
            except FileNotFoundError as exc:
                raise FileNotFoundError(
                    "Upload bytes are no longer available; please upload again."
                ) from exc

        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.get(
                f"{self.base_url}/storage/v1/object/{self.bucket}/{path}",
                headers=self._headers(),
            )
            response.raise_for_status()
            return response.content

    async def signed_url(self, path: str, expires_in: int = 3600) -> str | None:
        """
        Documents are private, so links are short-lived and signed rather than
        public. These are people's identity papers.
        """
        if not self.enabled:
            return None
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{self.base_url}/storage/v1/object/sign/{self.bucket}/{path}",
                headers=self._headers("application/json"),
                json={"expiresIn": expires_in},
            )
            if response.status_code != 200:
                return None
            signed = response.json().get("signedURL", "")
        return f"{self.base_url}/storage/v1{signed}" if signed else None

    async def delete(self, path: str) -> None:
        if not self.enabled:
            with suppress(ValueError):
                self._local_path(path).unlink(missing_ok=True)
            return
        async with httpx.AsyncClient(timeout=30) as client:
            await client.delete(
                f"{self.base_url}/storage/v1/object/{self.bucket}/{path}",
                headers=self._headers(),
            )


storage = SupabaseStorage()
