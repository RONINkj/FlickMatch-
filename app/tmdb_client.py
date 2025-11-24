# app/tmdb_client.py

from __future__ import annotations

import os
from functools import lru_cache
from typing import Any, Dict, List, Optional

import requests
from dotenv import load_dotenv


TMDB_API_BASE = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

# Load environment variables (.env)
load_dotenv()


class TMDBClientError(Exception):
    """Base error for TMDB client."""


class TMDBConfigError(TMDBClientError):
    """Configuration-related errors (e.g. missing API key)."""


class TMDBRequestError(TMDBClientError):
    """HTTP or network errors while calling TMDB."""


def _get_api_key() -> str:
    api_key = os.getenv("TMDB_API_KEY")
    if not api_key:
        raise TMDBConfigError(
            "TMDB_API_KEY is missing. Add it to your environment or .env file."
        )
    return api_key


@lru_cache(maxsize=1)
def _session() -> requests.Session:
    s = requests.Session()
    s.headers.update(
        {
            "Accept": "application/json",
        }
    )
    return s


def _request(path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Low-level helper to call TMDB API and return JSON.
    Raises TMDBRequestError on failure.
    """
    api_key = _get_api_key()
    url = f"{TMDB_API_BASE}{path}"
    all_params = {"api_key": api_key}
    if params:
        all_params.update(params)

    try:
        resp = _session().get(url, params=all_params, timeout=10)
    except requests.RequestException as exc:
        raise TMDBRequestError(f"Network error calling TMDB: {exc}") from exc

    if not resp.ok:
        raise TMDBRequestError(
            f"TMDB error {resp.status_code} for {path}: {resp.text[:200]}"
        )

    try:
        return resp.json()
    except ValueError as exc:
        raise TMDBRequestError("Failed to decode TMDB JSON response") from exc


def _build_poster_url(poster_path: Optional[str]) -> Optional[str]:
    if not poster_path:
        return None
    return f"{TMDB_IMAGE_BASE}{poster_path}"


def get_movie_details(movie_id: int) -> Dict[str, Any]:
    """
    Fetch movie details + credits from TMDB and return a simplified dict.

    Returned shape:
    {
        "movie_id": int,
        "title": str,
        "overview": str | None,
        "genres": [str, ...],
        "year": int | None,
        "poster_url": str | None,
        "rating": float | None,
        "runtime": int | None,
        "tmdb_url": str,
        "director": str | None,
        "cast": [str, ...]   # up to 4 names
    }
    """
    # Basic movie details
    movie_data = _request(
        f"/movie/{movie_id}",
        params={"language": "en-US"},
    )

    # Credits (for cast + director)
    credits_data = _request(
        f"/movie/{movie_id}/credits",
        params={"language": "en-US"},
    )

    title: str = movie_data.get("title") or movie_data.get("name") or "Unknown"
    overview: Optional[str] = movie_data.get("overview") or None
    genres: List[str] = [g["name"]
                         for g in movie_data.get("genres", []) if "name" in g]

    release_date = movie_data.get(
        "release_date") or movie_data.get("first_air_date")
    year: Optional[int] = None
    if release_date and isinstance(release_date, str) and len(release_date) >= 4:
        try:
            year = int(release_date[:4])
        except ValueError:
            year = None

    poster_url = _build_poster_url(movie_data.get("poster_path"))
    rating = movie_data.get("vote_average")
    runtime = movie_data.get("runtime")  # minutes, may be None
    tmdb_url = f"https://www.themoviedb.org/movie/{movie_id}"

    # Director
    director: Optional[str] = None
    crew = credits_data.get("crew") or []
    for member in crew:
        if member.get("job") == "Director":
            director = member.get("name")
            break

    # Top 4 cast names
    cast_list: List[str] = []
    for person in (credits_data.get("cast") or [])[:4]:
        name = person.get("name")
        if name:
            cast_list.append(name)

    return {
        "movie_id": movie_id,
        "title": title,
        "overview": overview,
        "genres": genres,
        "year": year,
        "poster_url": poster_url,
        "rating": rating,
        "runtime": runtime,
        "tmdb_url": tmdb_url,
        "director": director,
        "cast": cast_list,
    }
