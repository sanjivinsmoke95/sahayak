"""
Database engine / session factory and one-time initialisation helpers.

Schema management (no Alembic in this project):
    `init_db()` creates the pgvector extension, creates any missing TABLES, and
    then performs a lightweight, idempotent column sync so that pre-existing
    tables gain any columns that were later added to the models.

    This is necessary because SQLAlchemy's `create_all()` only ever creates
    *missing tables* — it never ALTERs an existing one. When new columns like
    `district`, `language` and `version` were added to the Service model, older
    databases kept their old `services` table and queries failed with
    `column services.district does not exist`. The sync below closes that gap
    WITHOUT dropping the table, so all existing rows are preserved.
"""
from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

from sqlalchemy import Column, create_engine, inspect, text
from sqlalchemy.engine import Dialect
from sqlalchemy.orm import Session, sessionmaker

from config.settings import settings
from models.db_models import Base

# `pool_pre_ping` transparently recovers from dropped connections, which is
# important for long-running scheduler jobs.
engine = create_engine(
    settings.sqlalchemy_url,
    pool_pre_ping=True,
    future=True,
)

SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, class_=Session)


# ---------------------------------------------------------------------------
# Schema sync helpers (kept as pure-ish functions so they are unit-testable)
# ---------------------------------------------------------------------------
def _missing_columns(conn, table) -> list[Column]:
    """Model columns that are not present on the live table."""
    existing = {c["name"] for c in inspect(conn).get_columns(table.name)}
    return [col for col in table.columns if col.name not in existing]


def _add_column_ddl(table_name: str, col: Column, dialect: Dialect) -> str:
    """
    Build an `ALTER TABLE ... ADD COLUMN` statement that preserves existing rows.

    A NOT NULL column needs a DEFAULT so existing rows can be backfilled; if the
    model provides no scalar default we add the column as nullable instead of
    failing. We only ever call this for columns already confirmed missing, so a
    plain (portable) ADD COLUMN is safe and idempotent.
    """
    coltype = col.type.compile(dialect=dialect)
    stmt = f"ALTER TABLE {table_name} ADD COLUMN {col.name} {coltype}"

    # Extract a scalar default from the model, if any (e.g. version=1, language='en').
    default_sql = None
    default = col.default
    if default is not None and getattr(default, "is_scalar", False):
        val = default.arg
        default_sql = f"'{val}'" if isinstance(val, str) else str(val)

    if not col.nullable:
        if default_sql is not None:
            stmt += f" DEFAULT {default_sql} NOT NULL"
        # else: leave nullable to avoid a NOT NULL add that would reject old rows
    elif default_sql is not None:
        stmt += f" DEFAULT {default_sql}"
    return stmt


def _sync_columns(conn) -> list[str]:
    """
    Add any missing columns (and their indexes) for every mapped table.

    Returns the list of DDL statements executed, which makes the operation easy
    to log and to assert against in tests. Runs inside the caller's transaction.
    """
    executed: list[str] = []
    dialect = conn.dialect
    for table in Base.metadata.sorted_tables:
        for col in _missing_columns(conn, table):
            ddl = _add_column_ddl(table.name, col, dialect)
            conn.execute(text(ddl))
            executed.append(ddl)
            if col.index:
                idx = f"CREATE INDEX IF NOT EXISTS ix_{table.name}_{col.name} ON {table.name} ({col.name})"
                conn.execute(text(idx))
                executed.append(idx)
    return executed


def init_db() -> None:
    """
    Ensure the database matches the models. Idempotent — safe to call on every
    startup and on an already-populated database (existing rows are preserved).
    """
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))

    # 1) Create any missing tables (e.g. service_versions on an older DB).
    Base.metadata.create_all(engine)

    # 2) Add any columns that older tables are missing (e.g. services.district).
    with engine.begin() as conn:
        _sync_columns(conn)


@contextmanager
def session_scope() -> Iterator[Session]:
    """Transactional session context manager."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
