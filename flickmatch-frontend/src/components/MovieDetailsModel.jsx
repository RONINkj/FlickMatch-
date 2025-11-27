// src/components/MovieDetailsModal.jsx

import React from "react";

export default function MovieDetailsModal({ movie, isOpen, onClose }) {
    // Only show when open + movie present
    if (!isOpen || !movie) return null;

    const {
        title,
        year,
        overview,
        genres,
        rating,
        runtime,
        poster_url,
        tmdb_url,
        director,
        cast,
    } = movie;

    return (
        <div className="fixed inset-0 z-200 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative w-[94%] max-w-3xl max-h-[85vh] rounded-3xl bg-zinc-950/95 border border-zinc-700/80 shadow-[0_40px_120px_rgba(0,0,0,0.95)] overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-800/80">
                    <div>
                        <h2 className="text-lg md:text-2xl font-semibold text-white">
                            {title}{" "}
                            {year && (
                                <span className="text-zinc-400 text-base md:text-lg font-normal">
                                    ({year})
                                </span>
                            )}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-300">
                            {rating !== undefined && rating !== null && (
                                <span className="px-2 py-1 rounded-full border border-zinc-600/80">
                                    TMDB {rating.toFixed(1)}/10
                                </span>
                            )}
                            {runtime && (
                                <span className="px-2 py-1 rounded-full border border-zinc-600/80">
                                    ⏱ {runtime} min
                                </span>
                            )}
                        </div>
                    </div>

                    {/* X close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-3 rounded-full border border-zinc-700/80 bg-zinc-900/80 px-2.5 py-1 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* BODY */}
                <div className="px-5 py-4 overflow-y-auto max-h-[calc(85vh-4rem)]">
                    {/* ---------- MOBILE / SMALL SCREENS LAYOUT ---------- */}
                    <div className="md:hidden space-y-4">
                        {/* Row: poster + where to watch + TMDB on the right */}
                        <div className="flex gap-4 items-start">
                            {poster_url && (
                                <div className="shrink-0">
                                    <img
                                        src={poster_url}
                                        alt={title}
                                        className="w-28 h-auto rounded-2xl object-cover border border-zinc-700/80"
                                    />
                                </div>
                            )}

                            <div className="flex-1 flex flex-col gap-3">
                                {genres && genres.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {genres.map((g) => (
                                            <span
                                                key={g}
                                                className="text-[11px] px-2 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-zinc-200"
                                            >
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* WHERE TO WATCH + TMDB BUTTON – high in the layout */}
                                <div className="space-y-2">
                                    <div>
                                        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-400 mb-1">
                                            WHERE TO WATCH
                                        </h3>
                                        <p className="text-sm text-zinc-300">
                                            Streaming availability coming soon. (We’ll wire this from
                                            TMDB watch providers or another service.)
                                        </p>
                                    </div>

                                    {tmdb_url && (
                                        <a
                                            href={tmdb_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex px-3 py-1.5 rounded-full bg-zinc-100 text-black text-[11px] font-medium hover:bg-white transition"
                                        >
                                            View on TMDB
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Overview, Director, Cast below the row */}
                        {overview && (
                            <div className="mt-2">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-400 mb-1">
                                    OVERVIEW
                                </h3>
                                <p className="text-sm text-zinc-100 leading-relaxed">
                                    {overview}
                                </p>
                            </div>
                        )}

                        {director && (
                            <div className="mt-3">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-400 mb-1">
                                    DIRECTOR
                                </h3>
                                <p className="text-sm text-zinc-200">{director}</p>
                            </div>
                        )}

                        {cast && cast.length > 0 && (
                            <div className="mt-3">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-400 mb-1">
                                    CAST
                                </h3>
                                <p className="text-sm text-zinc-200">
                                    {cast.join(", ")}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ---------- TABLET / DESKTOP LAYOUT (UNCHANGED) ---------- */}
                    <div className="hidden md:flex md:flex-row gap-4 md:gap-6">
                        {/* Poster */}
                        {poster_url && (
                            <div className="shrink-0 self-start">
                                <img
                                    src={poster_url}
                                    alt={title}
                                    className="w-32 md:w-40 h-auto rounded-2xl object-cover border border-zinc-700/80"
                                />
                            </div>
                        )}

                        {/* Details */}
                        <div className="flex-1">
                            {genres && genres.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {genres.map((g) => (
                                        <span
                                            key={g}
                                            className="text-[11px] px-2 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-zinc-200"
                                        >
                                            {g}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {overview && (
                                <div className="mb-4">
                                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-400 mb-1">
                                        OVERVIEW
                                    </h3>
                                    <p className="text-sm text-zinc-100 leading-relaxed">
                                        {overview}
                                    </p>
                                </div>
                            )}

                            {director && (
                                <div className="mb-3">
                                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-400 mb-1">
                                        DIRECTOR
                                    </h3>
                                    <p className="text-sm text-zinc-200">{director}</p>
                                </div>
                            )}

                            {cast && cast.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-400 mb-1">
                                        CAST
                                    </h3>
                                    <p className="text-sm text-zinc-200">
                                        {cast.join(", ")}
                                    </p>
                                </div>
                            )}

                            {/* Where to watch + TMDB (desktop layout) */}
                            <div className="mb-4">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-400 mb-1">
                                    WHERE TO WATCH
                                </h3>
                                <p className="text-sm text-zinc-300">
                                    Streaming availability coming soon. (We’ll wire this from
                                    TMDB watch providers or another service.)
                                </p>
                            </div>

                            {tmdb_url && (
                                <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                                    <a
                                        href={tmdb_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3 py-1.5 rounded-full bg-zinc-100 text-black font-medium hover:bg-white transition"
                                    >
                                        View on TMDB
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
