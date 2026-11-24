from fastapi import APIRouter, Query
from app.ml.price_predictor import predict_price, PricePredictionResponse

router = APIRouter(prefix="/prices", tags=["Price Forecasting"])


@router.get("/predict", response_model=PricePredictionResponse)
async def forecast_mandi_prices(
    crop: str = Query("Tomato", description="Crop name to predict"),
    district: str = Query("Nashik", description="District location")
):
    """
    Returns forward-looking 3-month mandi price trend forecasts with low and high bands.
    Guidance only.
    """
    return predict_price(crop=crop, district=district)
