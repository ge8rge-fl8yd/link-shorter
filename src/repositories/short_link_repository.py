from .base_repository import BaseRepository
from src.models import ShortLinkModel


class ShortLinkRepository(BaseRepository):
    model = ShortLinkModel
