from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User


class UserIdentity(Base, UUIDMixin, TimestampMixin):
    """One encrypted identity number belonging to one user.

    The number itself only ever exists here as AES-256-GCM ciphertext. `masked`
    is stored alongside it so listing screens — by far the common case — render
    without a decryption ever happening.

    Only the fields the app actually uses are kept: there is no name, address,
    date of birth or scan copied out of the document into this table.
    """

    __tablename__ = "user_identities"
    __table_args__ = (UniqueConstraint("user_id", "kind", name="uq_user_identity_kind"),)

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    # "aadhaar" | "pan"
    kind: Mapped[str] = mapped_column(String(16), nullable=False)

    # base64(nonce || ciphertext || tag). Never rendered, returned or logged.
    ciphertext: Mapped[str] = mapped_column(String(512), nullable=False)
    # Which configured key sealed this row, so keys can be rotated in place.
    key_version: Mapped[str] = mapped_column(String(16), nullable=False)

    # Display form, e.g. "XXXX XXXX 1234". Not the number.
    masked: Mapped[str] = mapped_column(String(32), nullable=False)

    user: Mapped["User"] = relationship()


class IdentityAuditLog(Base, UUIDMixin, TimestampMixin):
    """Metadata trail for every touch of an identity number.

    Deliberately holds no value, no ciphertext and no key version — only who
    did what, to which field, and whether it succeeded. Rows survive deletion
    of the identity itself, which is the point: "who read this, and when" must
    outlive the record.
    """

    __tablename__ = "identity_audit_logs"

    # Whose data was touched.
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    # Who performed it. Differs from user_id only for authorised support access.
    actor_user_id: Mapped[str] = mapped_column(String(64), nullable=False)

    kind: Mapped[str] = mapped_column(String(16), nullable=False)
    # "created" | "updated" | "viewed" | "deleted" | "denied"
    action: Mapped[str] = mapped_column(String(16), index=True, nullable=False)
    success: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    # Short, non-sensitive reason for a failure, e.g. "not_found", "forbidden".
    detail: Mapped[str] = mapped_column(String(64), default="")
