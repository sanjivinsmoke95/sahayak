from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import Setting, User
from app.schemas import SettingsRead, SettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


async def _get_or_create(db: AsyncSession, user: User) -> Setting:
    result = await db.execute(select(Setting).where(Setting.user_id == user.id))
    setting = result.scalar_one_or_none()
    if setting:
        return setting

    setting = Setting(user_id=user.id)
    db.add(setting)
    await db.flush()
    return setting


def _to_api(setting: Setting, user: User) -> SettingsRead:
    return SettingsRead(
        language=setting.language,  # type: ignore[arg-type]
        textSize=setting.text_size,  # type: ignore[arg-type]
        readAloud=setting.read_aloud,
        autoShrink=setting.auto_shrink,
        displayName=user.display_name,
    )


@router.get("", response_model=SettingsRead)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SettingsRead:
    return _to_api(await _get_or_create(db, user), user)


@router.patch("", response_model=SettingsRead)
async def update_settings(
    payload: SettingsUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SettingsRead:
    setting = await _get_or_create(db, user)

    if payload.language is not None:
        setting.language = payload.language
    if payload.textSize is not None:
        setting.text_size = payload.textSize
    if payload.readAloud is not None:
        setting.read_aloud = payload.readAloud
    if payload.autoShrink is not None:
        setting.auto_shrink = payload.autoShrink
    if payload.displayName is not None:
        user.display_name = payload.displayName

    await db.flush()
    return _to_api(setting, user)
