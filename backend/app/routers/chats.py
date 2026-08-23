from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models import Chat, Message, User
from app.schemas import ChatCreate, ChatRead, ChatWithMessages

router = APIRouter(prefix="/chats", tags=["chats"])


@router.get("", response_model=list[ChatRead])
async def list_chats(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[Chat]:
    result = await db.execute(
        select(Chat).where(Chat.user_id == user.id).order_by(Chat.created_at.desc())
    )
    return list(result.scalars().all())


@router.post("", response_model=ChatRead, status_code=status.HTTP_201_CREATED)
async def create_chat(
    payload: ChatCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Chat:
    chat = Chat(user_id=user.id, document_id=payload.documentId, title=payload.title)
    db.add(chat)
    await db.flush()
    return chat


@router.get("/{chat_id}", response_model=ChatWithMessages)
async def get_chat(
    chat_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Chat:
    result = await db.execute(
        select(Chat)
        .where(Chat.id == chat_id, Chat.user_id == user.id)
        .options(selectinload(Chat.messages))
    )
    chat = result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Chat not found")
    return chat


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat(
    chat_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    result = await db.execute(select(Chat).where(Chat.id == chat_id, Chat.user_id == user.id))
    chat = result.scalar_one_or_none()
    if chat:
        await db.delete(chat)


@router.get("/{chat_id}/messages")
async def list_messages(
    chat_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[dict]:
    result = await db.execute(
        select(Message)
        .join(Chat)
        .where(Chat.id == chat_id, Chat.user_id == user.id)
        .order_by(Message.created_at)
    )
    return [
        {
            "id": m.id,
            "role": m.role,
            "text": m.content,
            "list": m.bullet_list,
            "docRefs": m.document_refs,
            "createdAt": m.created_at.isoformat(),
        }
        for m in result.scalars().all()
    ]
