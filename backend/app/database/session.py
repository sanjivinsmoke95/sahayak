import re
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings


def _async_url(url: str) -> str:
    """Normalise a DATABASE_URL to the asyncpg driver.

    Managed hosts (Render, Heroku, Neon, …) hand out ``postgres://`` or
    ``postgresql://`` URLs. asyncpg needs the ``postgresql+asyncpg://`` scheme
    and does not accept libpq's ``sslmode`` query parameter, so strip it here.
    """
    url = re.sub(r"^postgres(ql)?://", "postgresql+asyncpg://", url, count=1)
    url = re.sub(r"[?&]sslmode=[^&]*", "", url)
    return url


engine = create_async_engine(
    _async_url(settings.database_url),
    echo=settings.db_echo,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding a session that always closes."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
