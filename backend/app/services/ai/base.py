from abc import ABC, abstractmethod
from typing import Any

from app.schemas import AskResponse


class AIProvider(ABC):
    """
    What every engine must do. Adding a provider means implementing this and
    registering it in the factory; nothing else in the app changes.
    """

    name: str = "base"

    @abstractmethod
    async def answer_question(
        self,
        question: str,
        lang: str,
        document: dict[str, Any] | None,
        documents: list[dict[str, Any]],
    ) -> AskResponse:
        """Answer using only what was extracted from the user's documents."""

    @abstractmethod
    async def analyze_document(self, text: str, filename: str) -> dict[str, Any]:
        """Turn raw OCR text into the trilingual explained-document shape."""

    @property
    def available(self) -> bool:
        return True
