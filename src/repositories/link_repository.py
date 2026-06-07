from .base_repository import BaseRepository
from src.models import LinkModel


class LinkRepository(BaseRepository):
    model = LinkModel
