# app/recommender.py

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Mapping

import numpy as np
import pandas as pd


@dataclass
class RecommenderModel:
    """
    Holds the data needed for content-based recommendations.
    """
    movies: pd.DataFrame
    similarity: np.ndarray
    title_to_index: Mapping[str, int]


def load_recommender(
    movies_path: Path | str,
    similarity_path: Path | str,
) -> RecommenderModel:
    """
    Load movies DataFrame and similarity matrix from disk.

    - movies.pkl: DataFrame with at least columns ["movie_id", "title", "tags"]
    - similarity.pkl: 2D numpy array (or saved via np.save)

    Returns a RecommenderModel instance.
    """
    movies_path = Path(movies_path)
    similarity_path = Path(similarity_path)

    if not movies_path.is_file():
        raise FileNotFoundError(f"movies.pkl not found at {movies_path}")
    if not similarity_path.is_file():
        raise FileNotFoundError(
            f"similarity.pkl not found at {similarity_path}")

    # movies.pkl created from your Google Colab notebook
    movies: pd.DataFrame = pd.read_pickle(movies_path)

    # similarity.pkl saved from cosine_similarity(vectors)
    # Could be np.save or pickled; allow both
    if similarity_path.suffix == ".npy":
        similarity = np.load(similarity_path, allow_pickle=True)
    else:
        similarity = pd.read_pickle(similarity_path)

    similarity = np.asarray(similarity)

    if similarity.ndim != 2:
        raise ValueError("similarity matrix must be 2-D")

    if len(movies) != similarity.shape[0]:
        raise ValueError(
            f"movies rows ({len(movies)}) and similarity size ({similarity.shape[0]}) "
            "do not match"
        )

    # Build mapping: lowercase title -> index (first occurrence)
    title_to_index: Dict[str, int] = {}
    for idx, raw_title in enumerate(movies["title"].astype(str).tolist()):
        key = raw_title.strip().lower()
        if key and key not in title_to_index:
            title_to_index[key] = idx

    return RecommenderModel(
        movies=movies,
        similarity=similarity,
        title_to_index=title_to_index,
    )


def recommend_titles(
    model: RecommenderModel,
    title: str,
    top_n: int = 5,
) -> List[Dict[str, Any]]:
    """
    Given a movie title, return top_n similar titles.

    Output format (for each result):
    {
        "movie_id": int,
        "title": str,
        "score": float
    }
    """
    if not title:
        raise KeyError("Empty title")

    key = title.strip().lower()
    if key not in model.title_to_index:
        raise KeyError(f"Title '{title}' not found in model")

    idx = model.title_to_index[key]

    distances = model.similarity[idx]
    if distances.shape[0] != len(model.movies):
        raise ValueError(
            "similarity row length does not match number of movies "
            f"({distances.shape[0]} vs {len(model.movies)})"
        )

    # Sort all movies by similarity score, descending
    indexed_scores = list(enumerate(distances))
    indexed_scores.sort(key=lambda x: x[1], reverse=True)

    results: List[Dict[str, Any]] = []
    for i, score in indexed_scores:
        if i == idx:
            # skip the same movie
            continue

        row = model.movies.iloc[i]
        movie_id = int(row["movie_id"])
        title_str = str(row["title"])

        results.append(
            {
                "movie_id": movie_id,
                "title": title_str,
                "score": float(score),
            }
        )

        if len(results) >= top_n:
            break

    return results
