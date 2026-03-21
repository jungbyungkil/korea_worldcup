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
        "player_features_korea": "/api/v1/worldcup2026/korea/player-features",
        "player_features_mexico": "/api/v1/worldcup2026/mexico/player-features",
        "player_features_south_africa": "/api/v1/worldcup2026/south-africa/player-features",
        "player_features_group_a_playoff_d": "/api/v1/worldcup2026/group-a-playoff-d/player-features",
        "supplement_sources": "/api/v1/worldcup2026/supplement/sources",
        "supplement_fd_wc": "/api/v1/worldcup2026/supplement/football-data/world-cup/matches",
        "supplement_tsdb_badges": "/api/v1/worldcup2026/supplement/thesportsdb/a-group-media",
    }
