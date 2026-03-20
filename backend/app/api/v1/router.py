from fastapi import APIRouter

from app.api.v1.endpoints import korea_history, player_features, worldcup2026

api_router = APIRouter()
api_router.include_router(korea_history.router)
api_router.include_router(worldcup2026.router)
api_router.include_router(player_features.router)
