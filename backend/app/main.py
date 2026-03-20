from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from app.api.v1.router import api_router

app = FastAPI(title="Korea World Cup API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "korea-worldcup-backend",
        "docs": "/docs",
        "korea_world_cup_history": "/api/v1/korea/world-cup-history",
        "player_features": "/api/v1/worldcup2026/korea/player-features",
    }
