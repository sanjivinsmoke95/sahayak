import json
from typing import Any

import httpx

from app.config import settings
from app.schemas import AskResponse
from app.services.ai.base import AIProvider
from app.services.ai.prompts import SYSTEM_ANALYZE, SYSTEM_EXPLAIN, question_prompt


class AnthropicProvider(AIProvider):
    name = "anthropic"
    endpoint = "https://api.anthropic.com/v1/messages"

    def __init__(self, model: str = "claude-sonnet-4-5") -> None:
        self.model = model
        self.api_key = settings.anthropic_api_key

    @property
    def available(self) -> bool:
        return bool(self.api_key)

    async def _chat(self, system: str, user: str) -> str:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                self.endpoint,
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": self.model,
                    "max_tokens": 1024,
                    "system": system,
                    "messages": [{"role": "user", "content": user}],
                },
            )
            response.raise_for_status()
            blocks = response.json().get("content", [])
            return "".join(b.get("text", "") for b in blocks if b.get("type") == "text")

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
