-- Runs once, when the Postgres container first creates its data directory.
-- The tables themselves are created by Alembic:
--     cd backend && alembic upgrade head

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Case-insensitive email matching, should you ever query users by email.
CREATE EXTENSION IF NOT EXISTS "citext";
