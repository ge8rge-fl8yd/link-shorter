from .base_repository import BaseRepository
from src.models import UserModel


class UserRepository(BaseRepository):
    model = UserModel
