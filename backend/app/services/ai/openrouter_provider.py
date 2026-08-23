import json
from typing import Any

import httpx

from app.config import settings
from app.schemas import AskResponse
from app.services.ai.base import AIProvider
from app.services.ai.prompts import SYSTEM_ANALYZE, SYSTEM_EXPLAIN, question_prompt


class OpenRouterProvider(AIProvider):
    """One key, many models. Useful for comparing providers cheaply."""

    name = "openrouter"
    endpoint = "https://openrouter.ai/api/v1/chat/completions"

    def __init__(self, model: str = "meta-llama/llama-3.3-70b-instruct") -> None:
        self.model = model
        self.api_key = settings.openrouter_api_key

    @property
    def available(self) -> bool:
        return bool(self.api_key)

    async def _chat(self, system: str, user: str) -> str:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                self.endpoint,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "HTTP-Referer": "https://sahayak.local",
                    "X-Title": "SAHAYAK",
                },
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    "temperature": 0.2,
                },
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]

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
