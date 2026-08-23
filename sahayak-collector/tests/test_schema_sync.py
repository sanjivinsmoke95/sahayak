"""
Regression test for the schema drift fix (services.district missing).

Reproduces an older `services` table that lacks columns later added to the
model, then confirms init_db()'s sync helpers add them, preserve existing rows,
backfill NOT NULL columns, and are idempotent — without any Postgres needed.
"""
from sqlalchemy import (
    Column,
    Integer,
    MetaData,
    String,
    Table,
    create_engine,
    inspect,
    text,
)
from sqlalchemy.dialects import postgresql

from database.connection import _add_column_ddl, _missing_columns
from models.db_models import Service


def _drifted_metadata() -> Table:
    md = MetaData()
    return Table(
        "services", md,
        Column("id", Integer, primary_key=True),
        Column("service_name", String(512)),
        Column("district", String(128), nullable=True, index=True),
        Column("language", String(8), nullable=False, default="en", index=True),
        Column("version", Integer, nullable=False, default=1),
    )


def test_postgres_ddl_backfills_not_null_columns():
    pg = postgresql.dialect()
    cols = {c.name: c for c in Service.__table__.columns}
    assert _add_column_ddl("services", cols["district"], pg) == (
        "ALTER TABLE services ADD COLUMN district VARCHAR(128)"
    )
    assert _add_column_ddl("services", cols["language"], pg) == (
        "ALTER TABLE services ADD COLUMN language VARCHAR(8) DEFAULT 'en' NOT NULL"
    )
    assert _add_column_ddl("services", cols["version"], pg) == (
        "ALTER TABLE services ADD COLUMN version INTEGER DEFAULT 1 NOT NULL"
    )


def test_sync_adds_missing_columns_and_preserves_data():
    eng = create_engine("sqlite://")
    with eng.begin() as c:
        c.execute(text("CREATE TABLE services (id INTEGER PRIMARY KEY, service_name VARCHAR(512))"))
        c.execute(text("INSERT INTO services (id, service_name) VALUES (1, 'Existing Row')"))

    tbl = _drifted_metadata()
    with eng.begin() as conn:
        assert {c.name for c in _missing_columns(conn, tbl)} == {"district", "language", "version"}
        for col in _missing_columns(conn, tbl):
            conn.execute(text(_add_column_ddl("services", col, conn.dialect)))

    with eng.begin() as conn:
        cols = {c["name"] for c in inspect(conn).get_columns("services")}
        row = conn.execute(text("SELECT id, service_name, language, version FROM services")).fetchone()
        assert {"district", "language", "version"} <= cols
        assert tuple(row) == (1, "Existing Row", "en", 1)      # preserved + backfilled
        assert _missing_columns(conn, tbl) == []                # idempotent
