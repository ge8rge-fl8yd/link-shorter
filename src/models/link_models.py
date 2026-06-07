from .base_models import Base, BaseWithID
from .user_models import UserModel
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, CheckConstraint, String, ForeignKey
from src.utils import generate_new_slug
from src.core import settings


class LinkModel(BaseWithID):
    __tablename__ = 'links'
    link: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    

class ShortLinkModel(Base):
    __tablename__ = 'short_links'
    slug: Mapped[str] = mapped_column(String(settings.SLUG_LENGTH), primary_key=True, default=lambda: generate_new_slug())
    clicks: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default='0',
        nullable=False
    )

    link_id: Mapped[str] = mapped_column(ForeignKey('links.id', ondelete='CASCADE'), index=True)
    link: Mapped["LinkModel"] = relationship()

    user_id: Mapped[str] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), index=True)
    user: Mapped["UserModel"] = relationship(back_populates="short_links")

    __table_args__ = (
        CheckConstraint('clicks >= 0', name='ck_clicks_gte_zero'),
    )
