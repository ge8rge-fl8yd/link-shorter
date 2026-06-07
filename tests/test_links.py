import pytest
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_redirect_success(client, mock_link_service):
    mock_link = AsyncMock()
    mock_link.link = "https://google.com"
    mock_link_service.redirect_to_link.return_value = mock_link
    response = await client.get("/links/test-slug", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "https://google.com"
    mock_link_service.redirect_to_link.assert_awaited_once_with(slug="test-slug")


@pytest.mark.asyncio
async def test_link_data_success(client, mock_link_service):
    expected_data = {
        "slug": "test-slug",
        "link": "https://yandex.ru",
        "clicks": 0
    }
    mock_link_service.get_link_data.return_value = expected_data

    response = await client.get("/links/link_data/test-slug")

    assert response.status_code == 200
    assert response.json() == expected_data
    mock_link_service.get_link_data.assert_awaited_once_with(slug="test-slug", user_id=1)


@pytest.mark.asyncio
async def test_user_links_success(client, mock_link_service):
    expected_list = [
        {"slug": "slug1", "link": "https://ya.ru", "clicks": 0},
        {"slug": "slug2", "link": "https://go.com", "clicks": 0}
    ]
    mock_link_service.get_user_links.return_value = expected_list

    response = await client.get("/links/user_links/?offset=0&limit=10")

    assert response.status_code == 200
    assert response.json() == expected_list
    mock_link_service.get_user_links.assert_awaited_once_with(user_id=1, offset=0, limit=10)


@pytest.mark.asyncio
async def test_add_link_success(client, mock_link_service):
    payload = {"link": "https://github.com"}
    expected_response = {
        "slug": "git-slug",
        "link": "https://github.com",
        "clicks": 0
    }
    mock_link_service.create_link.return_value = expected_response

    response = await client.post("/links/add_link", json=payload)

    assert response.status_code == 201
    assert response.json() == expected_response
    mock_link_service.create_link.assert_awaited_once_with(link="https://github.com", user_id=1)


@pytest.mark.asyncio
async def test_delete_link_success(client, mock_link_service):
    mock_link_service.delete_short_link.return_value = {"status": "deleted"}

    response = await client.delete("/links/delete_link?slug=test-slug")

    assert response.status_code == 200
    mock_link_service.delete_short_link.assert_awaited_once_with(user_id=1, slug="test-slug")