// // src/api/flickmatch.js

// const BASE_URL = "http://127.0.0.1:8000";

// export async function getRecommendations(title) {
//     const url = `${BASE_URL}/api/recommend?title=${encodeURIComponent(title)}`;

//     const res = await fetch(url, {
//         method: "GET",
//     });

//     if (!res.ok) {
//         throw new Error(`HTTP ${res.status} from /api/recommend`);
//     }

//     const data = await res.json();
//     // Expect: [{ movie_id, title, score }, ...]
//     return Array.isArray(data) ? data : [];
// }

// export async function getMovieDetails(movieId) {
//     if (movieId === null || movieId === undefined) {
//         throw new Error("movieId is required for getMovieDetails");
//     }

//     const url = `${BASE_URL}/api/movie/${movieId}`;

//     const res = await fetch(url, {
//         method: "GET",
//     });

//     if (!res.ok) {
//         throw new Error(`HTTP ${res.status} from /api/movie/${movieId}`);
//     }

//     const data = await res.json();
//     // Expect: { movie_id, title, overview, genres, year, poster_url, rating, runtime, tmdb_url }
//     return data;
// }

// src/api/flickmatch.js

// Updated to use the deployed backend URL (Render)
const BASE_URL = import.meta.env.VITE_API_URL || "https://flickmatch-backend.onrender.com";

export async function getRecommendations(title) {
    const url = `${BASE_URL}/recommend?title=${encodeURIComponent(title)}`;

    const res = await fetch(url, {
        method: "GET",
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status} from /recommend`);
    }

    const data = await res.json();
    // Expect: [{ movie_id, title, score }, ...]
    return Array.isArray(data) ? data : [];
}

export async function getMovieDetails(movieId) {
    if (movieId === null || movieId === undefined) {
        throw new Error("movieId is required for getMovieDetails");
    }

    const url = `${BASE_URL}/movie/${movieId}`;

    const res = await fetch(url, {
        method: "GET",
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status} from /movie/${movieId}`);
    }

    const data = await res.json();
    // Expect: { movie_id, title, overview, genres, year, poster_url, rating, runtime, tmdb_url }
    return data;
}
