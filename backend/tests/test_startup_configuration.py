"""The development shortcuts must not survive a deployment.

Auth and identity encryption both fail open so a fresh clone runs. That is only
safe while ENVIRONMENT says development; anywhere else, a missing CLERK_ISSUER
would put every visitor into one shared account.
"""

from types import SimpleNamespace

import pytest

from app.main import InsecureConfiguration, verify_production_configuration


def configure(monkeypatch, *, environment: str, issuer: str, origins: str = "https://app.example") -> None:
    monkeypatch.setattr(
        "app.main.settings",
        SimpleNamespace(
            app_name="SAHAYAK API",
            environment=environment,
            clerk_issuer=issuer,
            auth_enabled=bool(issuer),
            cors_origin_list=[o.strip() for o in origins.split(",") if o.strip()],
        ),
    )


def test_development_without_clerk_is_allowed(monkeypatch) -> None:
    """A fresh clone must still run with no configuration at all."""
    configure(monkeypatch, environment="development", issuer="")
    monkeypatch.setattr("app.main.crypto_available", lambda: False)
    verify_production_configuration()


@pytest.mark.parametrize("environment", ["production", "staging", "prod", "test"])
def test_non_development_without_clerk_refuses_to_start(monkeypatch, environment: str) -> None:
    """Anything that is not explicitly development is treated as real traffic."""
    configure(monkeypatch, environment=environment, issuer="")
    monkeypatch.setattr("app.main.crypto_available", lambda: True)

    with pytest.raises(InsecureConfiguration) as error:
        verify_production_configuration()

    assert "CLERK_ISSUER" in str(error.value)


def test_production_with_clerk_starts(monkeypatch) -> None:
    configure(monkeypatch, environment="production", issuer="https://clerk.example.com")
    monkeypatch.setattr("app.main.crypto_available", lambda: True)
    verify_production_configuration()


def test_production_rejects_wildcard_cors(monkeypatch) -> None:
    configure(
        monkeypatch,
        environment="production",
        issuer="https://clerk.example.com",
        origins="*",
    )
    monkeypatch.setattr("app.main.crypto_available", lambda: True)

    with pytest.raises(InsecureConfiguration) as error:
        verify_production_configuration()

    assert "CORS_ORIGINS" in str(error.value)


def test_every_problem_is_reported_at_once(monkeypatch) -> None:
    """One restart should surface everything wrong, not the first thing only."""
    configure(monkeypatch, environment="production", issuer="", origins="*")
    monkeypatch.setattr("app.main.crypto_available", lambda: True)

    with pytest.raises(InsecureConfiguration) as error:
        verify_production_configuration()

    message = str(error.value)
    assert "CLERK_ISSUER" in message and "CORS_ORIGINS" in message


def test_failure_message_names_the_environment(monkeypatch) -> None:
    configure(monkeypatch, environment="staging", issuer="")
    monkeypatch.setattr("app.main.crypto_available", lambda: True)

    with pytest.raises(InsecureConfiguration) as error:
        verify_production_configuration()

    assert "staging" in str(error.value)
