import pytest
from unittest.mock import AsyncMock, ANY, MagicMock
from fastapi import BackgroundTasks
import json

@pytest.mark.asyncio
async def test_registration_success(client, mock_auth_service):
    mock_auth_service.create_user_with_password.return_value = {"status": "success"}
    
    payload = {"email": "yeblan@example.com", "password": "supersecretpassword"}
    response = await client.post("/auth/registration", json=payload)
    
    assert response.status_code == 201
    assert response.json() == {"status": "success"}
    mock_auth_service.create_user_with_password.assert_awaited_once_with(
        email="yeblan@example.com", 
        password="supersecretpassword", 
        background_tasks=ANY
    )


@pytest.mark.asyncio
async def test_login_success(client, mock_auth_service):
    expected_token = {"access_token": "fake-jwt-token", "token_type": "bearer"}
    mock_auth_service.login_user_with_password.return_value = expected_token
    
    form_data = {"username": "yeblan@example.com", "password": "supersecretpassword"}
    response = await client.post("/auth/login", data=form_data)
    
    assert response.status_code == 200
    assert response.json() == expected_token
    mock_auth_service.login_user_with_password.assert_awaited_once_with(
        email="yeblan@example.com", 
        password="supersecretpassword"
    )


@pytest.mark.asyncio
async def test_verificate_success(client, mock_auth_service):
    expected_token = {"access_token": "new-jwt-token", "token_type": "bearer"}
    mock_auth_service.verification.return_value = expected_token
    
    payload = {"access_token": "verification-token"}
    response = await client.post("/auth/verificate", json=payload)
    
    assert response.status_code == 200
    assert response.json() == expected_token
    mock_auth_service.verification.assert_awaited_once_with(token="verification-token")


@pytest.mark.asyncio
async def test_reset_request_success(client, mock_auth_service):
    mock_auth_service.request_password_reset.return_value = {"status": "ok"}
    
    payload = {"email": "yeblan@example.com"}
    response = await client.patch("/auth/reset-password/request", json=payload)
    
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    mock_auth_service.request_password_reset.assert_awaited_once_with(
        email="yeblan@example.com", 
        background_tasks=ANY
    )


@pytest.mark.asyncio
async def test_reset_confirm_success(client, mock_auth_service):
    mock_auth_service.confirm_password_reset.return_value = {"status": "password updated"}
    
    payload = {"access_token": "reset-token", "new_password": "new_secure_password"}
    response = await client.patch("/auth/reset-password/confirm", json=payload)
    
    assert response.status_code == 200
    assert response.json() == {"status": "password updated"}
    mock_auth_service.confirm_password_reset.assert_awaited_once_with(
        token="reset-token", 
        new_password="new_secure_password"
    )


@pytest.mark.asyncio
async def test_delete_request_success(client, mock_auth_service, mock_user):
    expected_token = {"access_token": "delete-confirmation-token", "token_type": "bearer"}
    mock_auth_service.request_account_delete.return_value = expected_token
    
    response = await client.delete("/auth/delete-account/request")
    
    assert response.status_code == 200
    assert response.json() == expected_token
    mock_auth_service.request_account_delete.assert_awaited_once_with(
        user_id=mock_user.id, 
        background_tasks=ANY
    )


@pytest.mark.asyncio
async def test_delete_confirm_success(client, mock_auth_service, mock_user):
    mock_auth_service.confirm_account_delete.return_value = {"status": "deleted"}
    
    payload = {"one_time_password": "123456", "access_token": "delete-token"}
    
    response = await client.request(
        method="DELETE",
        url="/auth/delete-account/confirm",
        json=payload
    )
    
    assert response.status_code == 200
    assert response.json() == {"status": "deleted"}
    mock_auth_service.confirm_account_delete.assert_awaited_once_with(
        user_id=mock_user.id, 
        user_otp="123456", 
        token="delete-token"
    )

@pytest.mark.asyncio
async def test_get_google_oauth2_link(client, mock_auth_service):
    mock_auth_service.generate_google_oauth2_link = MagicMock(return_value="https://accounts.google.com/o/oauth2/...")
    
    response = await client.get("/auth/google/url", follow_redirects=False)

    assert response.status_code == 307
    assert response.headers["location"] == "https://accounts.google.com/o/oauth2/..."
    mock_auth_service.generate_google_oauth2_link.assert_called_once()


@pytest.mark.asyncio
async def test_google_login_success(client, mock_auth_service):
    expected_token = {"access_token": "google-jwt-token", "token_type": "bearer"}
    mock_auth_service.google_login.return_value = expected_token
    
    response = await client.post("/auth/google/login?code=auth_code_from_google")
    
    assert response.status_code == 200
    assert response.json() == expected_token
    mock_auth_service.google_login.assert_awaited_once_with(code="auth_code_from_google")