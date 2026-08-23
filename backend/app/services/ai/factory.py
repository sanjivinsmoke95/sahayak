from app.config import settings
from app.services.ai.anthropic_provider import AnthropicProvider
from app.services.ai.base import AIProvider
from app.services.ai.gemini_provider import GeminiProvider
from app.services.ai.openai_provider import OpenAIProvider
from app.services.ai.openrouter_provider import OpenRouterProvider
from app.services.ai.rule_based import RuleBasedProvider

_REGISTRY: dict[str, type[AIProvider]] = {
    "openai": OpenAIProvider,
    "anthropic": AnthropicProvider,
    "gemini": GeminiProvider,
    "openrouter": OpenRouterProvider,
    "rule-based": RuleBasedProvider,
}


def get_provider(name: str | None = None) -> AIProvider:
    """
    Returns the requested provider, or the configured default, falling back to
    the rule-based engine when a key is missing. The app must keep answering.
    """
    candidate = name or settings.default_ai_provider
    provider_cls = _REGISTRY.get(candidate, RuleBasedProvider)
    provider = provider_cls()
    return provider if provider.available else RuleBasedProvider()


def available_providers() -> list[AIProvider]:
    return [cls() for cls in _REGISTRY.values() if cls().available]
