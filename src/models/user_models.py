from .base_models import BaseWithID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .link_models import ShortLinkModel


class UserModel(BaseWithID):
    __tablename__ = 'users'

    email: Mapped[str] = mapped_column(String(256), unique=True, nullable=False)

    hashed_password: Mapped[str] = mapped_column(String(64), nullable=True, default=None)
    google_id: Mapped[str] = mapped_column(String(512), unique=True, nullable=True, default=None)

    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean(), default=False)

    short_links: Mapped[list["ShortLinkModel"]] = relationship(
        "ShortLinkModel",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=False
    )
