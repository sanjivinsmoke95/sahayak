import json
from typing import Any

import httpx

from app.config import settings
from app.schemas import AskResponse
from app.services.ai.base import AIProvider
from app.services.ai.prompts import SYSTEM_ANALYZE, SYSTEM_EXPLAIN, question_prompt


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

    async def analyze_document(self, text: str, filename: str) -> dict[str, Any]:
        raw = await self._chat(SYSTEM_ANALYZE, f"File: {filename}\n\n{text}")
        return json.loads(raw.strip().removeprefix("```json").removesuffix("```").strip())
