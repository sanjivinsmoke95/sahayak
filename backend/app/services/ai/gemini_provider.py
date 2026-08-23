import json
from typing import Any

import httpx

from app.config import settings
from app.schemas import AskResponse
from app.services.ai.base import AIProvider
from app.services.ai.prompts import SYSTEM_ANALYZE, SYSTEM_EXPLAIN, question_prompt


class GeminiProvider(AIProvider):
    name = "gemini"

    def __init__(self, model: str = "gemini-2.0-flash") -> None:
        self.model = model
        self.api_key = settings.gemini_api_key

    @property
    def available(self) -> bool:
        return bool(self.api_key)

    async def _chat(self, system: str, user: str) -> str:
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.model}:generateContent?key={self.api_key}"
        )
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                url,
                json={
                    "systemInstruction": {"parts": [{"text": system}]},
                    "contents": [{"role": "user", "parts": [{"text": user}]}],
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
    ) -> AskResponse:
        prompt = question_prompt(question, lang, document, documents)
        text = await self._chat(SYSTEM_EXPLAIN, prompt)
        return AskResponse(text=text.strip())

    async def analyze_document(self, text: str, filename: str) -> dict[str, Any]:
        raw = await self._chat(SYSTEM_ANALYZE, f"File: {filename}\n\n{text}")
        return json.loads(raw.strip().removeprefix("```json").removesuffix("```").strip())
