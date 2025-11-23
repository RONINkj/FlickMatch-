from pathlib import Path
import pickle

# Base paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

# Load model artifacts once at startup
with open(DATA_DIR / "movies.pkl", "rb") as f:
    movies = pickle.load(f)

with open(DATA_DIR / "similarity.pkl", "rb") as f:
    similarity = pickle.load(f)


def recommend(movie_title: str, top_n: int = 5):
    """
    Returns a list of similar movies:
    [
      {"title": "..."},
      {"title": "..."},
      ...
    ]
    """
    movie_title = movie_title.strip()

    # Find index of requested movie
    try:
        idx = movies[movies['title'].str.lower(
        ) == movie_title.lower()].index[0]
    except IndexError:
        # movie not found
        return []

    # similarity scores
    distances = similarity[idx]

    # Sort high → low, skip itself
    movie_list = sorted(
        list(enumerate(distances)),
        reverse=True,
        key=lambda x: x[1]
    )[1: top_n + 1]

    results = []
    for i, score in movie_list:
        results.append({
            "title": str(movies.iloc[i].title),
            "score": float(score)
        })

    return results
