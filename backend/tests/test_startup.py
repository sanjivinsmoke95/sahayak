from contextlib import asynccontextmanager

import pytest

from app import main


class _Connection:
    def __init__(self) -> None:
        self.metadata = None

    async def run_sync(self, callback) -> None:
        self.metadata = callback


class _Engine:
    def __init__(self, connection: _Connection) -> None:
        self.connection = connection

    @asynccontextmanager
    async def begin(self):
        yield self.connection


@pytest.mark.asyncio
async def test_first_start_creates_missing_database_tables(monkeypatch) -> None:
    """A fresh database must be usable without a missing migration revision."""
    connection = _Connection()
    monkeypatch.setattr(main, "engine", _Engine(connection))

    await main.ensure_database_schema()

    assert connection.metadata.__self__ is main.Base.metadata
    assert connection.metadata.__func__ is main.Base.metadata.create_all.__func__
