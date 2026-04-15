import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    import app.api.api_v1.endpoints.contact as contact_ep

    async def fake_insert(table: str, data: dict, token: str | None = None) -> dict:
        return {"success": True, "data": [data]}

    async def fake_select(
        table: str,
        columns: str = "*",
        filters: dict | None = None,
        limit: int = 1000,
        offset: int = 0,
        order_by: str | None = None,
        ascending: bool = True,
        token: str | None = None,
    ) -> list[dict]:
        return []

    async def fake_update(table: str, data: dict, filters: dict, token: str | None = None) -> dict:
        return {"success": True, "data": [data]}

    async def fake_save_offline(submission_type: str, data: dict) -> bool:
        return True

    def fake_send_email(to_email: str, subject: str, content: str) -> bool:
        return True

    monkeypatch.setattr(contact_ep, "db_insert", fake_insert)
    monkeypatch.setattr(contact_ep, "db_select", fake_select)
    monkeypatch.setattr(contact_ep, "db_update", fake_update)
    monkeypatch.setattr(contact_ep, "_save_offline", fake_save_offline)
    monkeypatch.setattr(contact_ep.email, "send_email", fake_send_email)
    monkeypatch.setattr(contact_ep, "check_rate_limit", lambda client_ip, limit_seconds=60: True)

    app = FastAPI()
    app.include_router(contact_ep.router, prefix="/api/v1/contact")
    return TestClient(app)


def test_newsletter_subscription_returns_success_message(client: TestClient) -> None:
    response = client.post(
        "/api/v1/contact/newsletter",
        json={"email": "newsletter@example.com", "source": "footer"},
    )

    assert response.status_code == 200, response.text
    assert response.json()["status"] == "success"
    assert "subscribed" in response.json()["message"].lower()


def test_contact_submission_returns_success_message(client: TestClient) -> None:
    response = client.post(
        "/api/v1/contact/submit",
        json={
            "first_name": "Codex",
            "last_name": "Tester",
            "email": "contact@example.com",
            "phone": "+254700000000",
            "city": "Nairobi",
            "state": "Nairobi",
            "country": "Kenya",
            "inquiry_type": "general",
            "topic": "General question",
            "message": "Can you help?",
        },
    )

    assert response.status_code == 200, response.text
    assert response.json()["status"] == "success"
    assert "thank you for contacting us" in response.json()["message"].lower()


def test_contact_message_returns_success_message(client: TestClient) -> None:
    response = client.post(
        "/api/v1/contact/message",
        json={
            "full_name": "Codex Tester",
            "email": "quick@example.com",
            "subject": "Quick note",
            "message": "Hello from the quick form",
        },
    )

    assert response.status_code == 200, response.text
    assert response.json() == {
        "status": "success",
        "message": "Message sent! We will get back to you shortly.",
    }
