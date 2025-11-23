from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from .recommender import recommend

app = FastAPI()

# Allow frontend (HTML) to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/recommend")
def recommend_endpoint(title: str = Query(..., description="Movie title")):
    movies = recommend(title, top_n=5)
    return JSONResponse(movies)
