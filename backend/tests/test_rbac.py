import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_unauthorized_access_fails(client: AsyncClient):
    # Accessing farmer dashboard endpoint without token
    response = await client.get("/api/v1/farmer/yields")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_route_forbidden_for_anonymous(client: AsyncClient):
    response = await client.get("/api/v1/admin/dashboard")
    assert response.status_code == 401
