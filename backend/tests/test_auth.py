import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_customer_registration(client: AsyncClient):
    payload = {
        "full_name": "Test Customer",
        "phone": "+919999900001",
        "email": "testcustomer@example.com",
        "password": "Password123!",
        "address_line": "123 Farm Road",
        "city": "Pune",
        "state": "Maharashtra",
        "pincode": "411001"
    }
    response = await client.post("/api/v1/auth/register/customer", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "customer"


@pytest.mark.asyncio
async def test_farmer_registration_pending_status(client: AsyncClient):
    payload = {
        "full_name": "Test Farmer",
        "phone": "+919999900002",
        "email": "testfarmer@example.com",
        "password": "Password123!",
        "farm_name": "Green Acres",
        "village": "Wai",
        "district": "Satara",
        "state": "Maharashtra",
        "land_size_acres": 5.5,
        "id_proof_url": "https://example.com/id.jpg"
    }
    response = await client.post("/api/v1/auth/register/farmer", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "farmer"
    assert data["user"]["farmer_profile"]["verification_status"] == "pending"
