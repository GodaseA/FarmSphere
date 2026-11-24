from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.farmer import router as farmer_router
from app.api.v1.disease import router as disease_router
from app.api.v1.listings import router as listings_router
from app.api.v1.cart import router as cart_router
from app.api.v1.orders import router as orders_router
from app.api.v1.payments import router as payments_router
from app.api.v1.notifications import router as notif_router
from app.api.v1.admin import router as admin_router
from app.api.v1.prices import router as prices_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(farmer_router)
api_v1_router.include_router(disease_router)
api_v1_router.include_router(listings_router)
api_v1_router.include_router(cart_router)
api_v1_router.include_router(orders_router)
api_v1_router.include_router(payments_router)
api_v1_router.include_router(notif_router)
api_v1_router.include_router(admin_router)
api_v1_router.include_router(prices_router)
