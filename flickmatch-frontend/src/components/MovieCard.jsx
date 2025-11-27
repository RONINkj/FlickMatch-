// src/components/MovieCard.jsx

import React from "react";

export default function MovieCard({
    movie,
    onMoreDetails,
    isLocked,
    onUnselect,
}) {
    if (!movie) {
        return (
            <div className="pointer-events-auto rounded-3xl bg-zinc-950/90 border border-zinc-800/80 shadow-[0_30px_120px_rgba(0,0,0,0.95)] p-5 md:p-6 max-w-xl">
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-pink-400 mb-2">
                    FlickMatch
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
                    Hover a poster or click a recommended movie
                </h2>
                <p className="text-sm text-zinc-300">
                    Move your cursor over a movie poster on the wall or use the search
                    panel to find a title. Detailed info will appear here.
                </p>
            </div>
        );
    }

    const {
        title,
        year,
        genres = [],
        overview,
        rating,
        runtime,
    } = movie;

    let label = "CURRENTLY HOVERED";
    if (movie.source === "recommendation") {
        label = "RECOMMENDED FOR YOU";
    } else if (isLocked) {
        label = "CURRENTLY SELECTED";
    }

    const handleMoreDetails = () => {
        if (!onMoreDetails) return;
        onMoreDetails(movie);
    };

    const handleUnselect = () => {
        if (!onUnselect) return;
        onUnselect();
    };

    return (
        <div className="pointer-events-auto rounded-3xl bg-zinc-950/90 border border-zinc-800/80 shadow-[0_30px_120px_rgba(0,0,0,0.95)] p-5 md:p-6 max-w-xl">
            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-pink-400 mb-1">
                        {label}
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold text-white">
                        {title}{" "}
                        {year && (
                            <span className="text-base font-normal text-zinc-400">
                                ({year})
                            </span>
                        )}
                    </h2>
                </div>
                {rating !== undefined && rating !== null && (
                    <div className="ml-3 mt-1 rounded-full bg-zinc-900/80 border border-zinc-700 px-3 py-1 text-[11px] text-zinc-200">
                        TMDB {rating.toFixed(1)}/10
                    </div>
                )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {genres.map((g) => (
                        <span
                            key={g}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-zinc-200"
                        >
                            {g}
                        </span>
                    ))}
                </div>
            )}

            {/* Overview */}
            {overview && (
                <p className="text-sm text-zinc-100 leading-relaxed mb-3">
                    {overview}
                </p>
            )}

            {/* Runtime */}
            {runtime && (
                <div className="flex items-center gap-2 text-[11px] text-zinc-300 mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700">
                        ⏱ {runtime} min
                    </span>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={handleMoreDetails}
                    className="rounded-full bg-white text-black text-xs font-semibold px-4 py-2 hover:bg-zinc-100 transition"
                >
                    More details
                </button>

                {isLocked && (
                    <button
                        type="button"
                        onClick={handleUnselect}
                        className="rounded-full bg-zinc-900 text-zinc-200 text-xs font-medium px-4 py-2 border border-zinc-700 hover:bg-zinc-800 transition"
                    >
                        Unselect
                    </button>
                )}
            </div>
        </div>
    );
}
