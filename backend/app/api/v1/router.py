from fastapi import APIRouter

from app.api.v1.endpoints import ai_insights, ai_playground, ai_seven_fun, korea_history, player_features, supplement, worldcup2026

api_router = APIRouter()
api_router.include_router(korea_history.router)
api_router.include_router(worldcup2026.router)
api_router.include_router(supplement.router)
api_router.include_router(player_features.router)
api_router.include_router(ai_seven_fun.router)
api_router.include_router(ai_playground.router)
api_router.include_router(ai_insights.router)
