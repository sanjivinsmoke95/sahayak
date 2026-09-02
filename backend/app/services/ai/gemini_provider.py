import base64
import json
from io import BytesIO
from typing import Any

import httpx

from app.config import settings
from app.schemas import AskResponse
from app.services.ai.base import AIProvider
from app.services.ai.prompts import (
    SYSTEM_ANALYZE,
    SYSTEM_EXPLAIN,
    SYSTEM_GENERAL,
    question_prompt,
)


class GeminiProvider(AIProvider):
    name = "gemini"

    def __init__(self, model: str = "gemini-3.6-flash") -> None:
        self.model = model
        self.api_key = settings.gemini_api_key

    @property
    def available(self) -> bool:
        return bool(self.api_key)

    async def _chat(self, system: str, user: str, history: list[dict[str, str]] | None = None) -> str:
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.model}:generateContent?key={self.api_key}"
        )
        
        raw_messages = []
        if history:
            for msg in history:
                if not isinstance(msg, dict):
                    continue
                r = msg.get("role")
                t = msg.get("text")
                if not isinstance(t, str) or not t.strip():
                    continue
                role = "model" if r == "assistant" else "user"
                raw_messages.append({"role": role, "text": t.strip()})
        
        if user and user.strip():
            raw_messages.append({"role": "user", "text": user.strip()})
            
        contents = []
        for msg in raw_messages:
            if not contents:
                contents.append({"role": msg["role"], "parts": [{"text": msg["text"]}]})
            else:
                last_msg = contents[-1]
                if last_msg["role"] == msg["role"]:
                    # Merge consecutive roles
                    last_text = last_msg["parts"][0]["text"]
                    last_msg["parts"][0]["text"] = f"{last_text}\n\n{msg['text']}"
                else:
                    contents.append({"role": msg["role"], "parts": [{"text": msg["text"]}]})
                    
        if not contents:
            return ""

        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                url,
                json={
                    "systemInstruction": {"parts": [{"text": system}]},
                    "contents": contents,
                    "generationConfig": {"temperature": 0.2},
                },
            )
            response.raise_for_status()
            candidates = response.json().get("candidates", [])
            if not candidates:
                return ""
            parts = candidates[0].get("content", {}).get("parts", [])
            return "".join(p.get("text", "") for p in parts)

    async def answer_question(
        self,
        question: str,
        lang: str,
        document: dict[str, Any] | None,
        documents: list[dict[str, Any]],
        grounded_context: str = "",
        history: list[dict[str, str]] | None = None,
    ) -> AskResponse:
        prompt = question_prompt(question, lang, document, documents, grounded_context)
        text = await self._chat(SYSTEM_EXPLAIN, prompt, history)
        return AskResponse(text=text.strip())

    async def answer_general(
        self,
        question: str,
        lang: str,
        history: list[dict[str, str]] | None = None,
    ) -> AskResponse:
        """General guidance when there is no grounded document or official hit.

        Uses a looser system prompt so the assistant still helps instead of
        refusing, while telling the reader to confirm details officially.
        """
        text = await self._chat(SYSTEM_GENERAL, question, history)
        return AskResponse(text=text.strip())

    async def analyze_document(self, text: str, filename: str) -> dict[str, Any]:
        raw = await self._chat(SYSTEM_ANALYZE, f"File: {filename}\n\n{text}")
        return json.loads(raw.strip().removeprefix("```json").removesuffix("```").strip())

    async def analyze_image(self, content: bytes, mime_type: str, filename: str) -> dict[str, Any]:
        """Read a document straight from its bytes with the vision model.

        This bypasses OCR entirely, so it works on photos of any clarity and on
        scanned PDFs with no text layer — no Tesseract install required. Images
        are normalised to PNG so any Pillow-readable format is accepted; PDFs are
        sent as-is (the model reads them natively).
        """
        data = content
        send_mime = mime_type or "application/octet-stream"

        if send_mime.startswith("image/") or not send_mime.startswith("application/"):
            try:
                from PIL import Image

                image = Image.open(BytesIO(content))
                image = image.convert("RGB")
                buffer = BytesIO()
                image.save(buffer, format="PNG")
                data = buffer.getvalue()
                send_mime = "image/png"
            except Exception:
                # Not a Pillow-readable image (or already fine); send original bytes.
                if not send_mime.startswith(("image/", "application/pdf")):
                    send_mime = "image/png"

        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.model}:generateContent?key={self.api_key}"
        )
        prompt = (
            f"File: {filename}\n\nRead every visible field in this government "
            "document image and analyse it. If parts are blurry, infer the most "
            "likely intended text from context and legible characters."
        )
        async with httpx.AsyncClient(timeout=90) as client:
            response = await client.post(
                url,
                json={
                    "systemInstruction": {"parts": [{"text": SYSTEM_ANALYZE}]},
                    "contents": [
                        {
                            "role": "user",
                            "parts": [
                                {"text": prompt},
                                {"inline_data": {"mime_type": send_mime, "data": base64.b64encode(data).decode()}},
                            ],
                        }
                    ],
                    "generationConfig": {"temperature": 0.2},
                },
            )
            response.raise_for_status()
            candidates = response.json().get("candidates", [])
            parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
            raw = "".join(p.get("text", "") for p in parts)
        return json.loads(raw.strip().removeprefix("```json").removesuffix("```").strip())
