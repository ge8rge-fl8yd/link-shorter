import pytest
from unittest.mock import AsyncMock, MagicMock
from httpx import ASGITransport, AsyncClient

from src.main import app
from src.dependencies import get_link_service, get_auth_service, get_current_user
from src.models import UserModel

@pytest.fixture
def mock_link_service():
    """Фикстура для мока LinkService."""
    return AsyncMock()

@pytest.fixture
def mock_auth_service():
    """Фикстура для мока AuthService."""
    return AsyncMock()

@pytest.fixture
def mock_user():
    """Фикстура фейкового пользователя для прохождения авторизации."""
    return UserModel(id=1, email="yeblan@example.com")

@pytest.fixture
async def client(mock_link_service, mock_auth_service, mock_user):
    """Асинхронный клиент HTTPX с переопределенными зависимостями."""
    
    # Переопределяем зависимости бэкенда на наши моки
    app.dependency_overrides[get_link_service] = lambda: mock_link_service
    app.dependency_overrides[get_auth_service] = lambda: mock_auth_service
    app.dependency_overrides[get_current_user] = lambda: mock_user

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
        
    # Чистим оверрайды после каждого теста, чтобы не засорять окружение
    app.dependency_overrides.clear()