import pytest
import io
from PIL import Image
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_price_prediction_guidance_endpoint(client: AsyncClient):
    response = await client.get("/api/v1/prices/predict?crop=Tomato&district=Nashik")
    assert response.status_code == 200
    data = response.json()
    assert data["crop"] == "Tomato"
    assert "forecast" in data
    assert len(data["forecast"]) == 3
    assert "expected_price_per_kg" in data["forecast"][0]
