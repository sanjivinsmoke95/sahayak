from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import AIModel, User
from app.schemas import AIModelRead

router = APIRouter(prefix="/ai-models", tags=["ai-models"])

# The catalogue. Availability is decided by which API keys are configured, so
# the picker never offers a provider that cannot answer.
CATALOGUE = [
    ("rule-based", "rule-based", "Offline engine"),
    ("openai", "gpt-4o-mini", "OpenAI GPT-4o mini"),
    ("anthropic", "claude-sonnet-4-5", "Claude Sonnet 4.5"),
    ("gemini", "gemini-2.0-flash", "Gemini 2.0 Flash"),
    ("openrouter", "meta-llama/llama-3.3-70b-instruct", "Llama 3.3 70B (OpenRouter)"),
]


@router.get("", response_model=list[AIModelRead])
async def list_models(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
) -> list[AIModelRead]:
    result = await db.execute(select(AIModel).order_by(AIModel.provider))
    return [
        AIModelRead(
            id=model.id,
            provider=model.provider,
            modelKey=model.model_key,
            displayName=model.display_name,
            isDefault=model.is_default,
            isAvailable=model.is_available,
        )
        for model in result.scalars().all()
    ]
