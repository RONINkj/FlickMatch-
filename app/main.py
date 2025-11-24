# app/main.py

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .recommender import load_recommender, RecommenderModel, recommend_titles
from .tmdb_client import TMDBClientError, get_movie_details

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="FlickMatch API")

# CORS so React frontend can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load recommender on startup
recommender: RecommenderModel = load_recommender(
    movies_path=BASE_DIR / "data" / "movies.pkl",
    similarity_path=BASE_DIR / "data" / "similarity.pkl",
)


@app.get("/api/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/api/recommend")
def api_recommend(
    title: str = Query(..., description="Movie title to search for"),
    top_n: int = Query(5, ge=1, le=20),
) -> List[Dict[str, Any]]:
    """
    Given a movie title, return up to `top_n` similar movies from our model.
    Shape: [{ movie_id, title, score }, ...]
    """
    try:
        results = recommend_titles(recommender, title, top_n=top_n)
        return results
    except KeyError:
        raise HTTPException(
            status_code=404, detail="Movie title not found in model")
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/movie/{movie_id}")
def api_movie(movie_id: int) -> Dict[str, Any]:
    """
    Fetch detailed info for a movie from TMDB, including:
    - title, overview, genres, year, rating, runtime
    - poster_url, tmdb_url
    - director
    - top 4 cast members
    """
    try:
        details = get_movie_details(movie_id)
        return details
    except TMDBClientError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/wall-movies")
def api_wall_movies(
    limit: int = Query(
        260,
        ge=60,
        le=800,
        description="Number of movies to include in the poster wall",
    )
) -> List[Dict[str, Any]]:
    """
    Return a list of movies for the PosterWall.

    Each item:
    {
      "movie_id": int,
      "title": str,
      "year": int | null,
      "poster_url": str | null,
      "rating": float | null,
      "genres": [str, ...],
      "runtime": int | null,
      "tmdb_url": str,
      "overview": str | null
    }
    """
    import random

    df = recommender.movies
    if df.empty:
        return []

    n = min(limit, len(df))
    sample_indices = random.sample(list(df.index), k=n)
    subset = df.loc[sample_indices]

    results: List[Dict[str, Any]] = []

    for _, row in subset.iterrows():
        raw_id = row.get("movie_id")
        if raw_id is None:
            continue
        try:
            movie_id = int(raw_id)
        except (TypeError, ValueError):
            continue

        try:
            details = get_movie_details(movie_id)
        except TMDBClientError:
            continue
        except Exception:
            continue

        results.append(
            {
                "movie_id": movie_id,
                "title": details.get("title"),
                "year": details.get("year"),
                "poster_url": details.get("poster_url"),
                "rating": details.get("rating"),
                "genres": details.get("genres") or [],
                "runtime": details.get("runtime"),
                "tmdb_url": details.get("tmdb_url"),
                "overview": details.get("overview"),
            }
        )

    return results
