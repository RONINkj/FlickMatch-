// src/components/SearchPanel.jsx
import { useEffect, useState } from "react";

export default function SearchPanel({
    isOpen,
    onClose,
    onSearch,
    recommendations,
    isSearching,
    error,
    onPick,
}) {
    const [query, setQuery] = useState("");
    const [searchType, setSearchType] = useState("movie"); // "movie" | "series"

    // When panel closes, reset local state
    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setSearchType("movie");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;
        // App currently expects just title; extra arg (searchType) is ignored safely.
        onSearch(trimmed, searchType);
    };

    const handleClear = () => {
        setQuery("");
    };

    const hasQuery = query.trim().length > 0;

    return (
        // Fixed overlay container ONLY for position; no dark bg overlay
        <div className="pointer-events-none fixed inset-0 flex justify-center md:justify-end items-start z-40">
            {/* Card */}
            <div className="pointer-events-auto mt-20 md:mt-24 w-[92%] max-w-sm md:max-w-sm lg:mr-4 rounded-3xl bg-black/90 border border-zinc-700/70 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] p-4 sm:p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                        Find Similar Movies
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-xs text-zinc-400 hover:text-zinc-100 px-2 py-1 rounded-full hover:bg-zinc-800"
                    >
                        ✕
                    </button>
                </div>

                {/* Movie / Series toggle (Series = coming soon) */}
                <div className="flex items-center gap-2 mb-3 text-[11px]">
                    {/* Movie pill */}
                    <button
                        type="button"
                        onClick={() => setSearchType("movie")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs transition-colors ${searchType === "movie"
                                ? "border-pink-500 bg-zinc-900 text-zinc-50"
                                : "border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500"
                            }`}
                    >
                        {/* Movie icon (same style as TopBar) */}
                        <span className="h-3.5 w-3.5">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="3" y="5" width="18" height="14" rx="2" />
                                <path d="M7 5l2 4" />
                                <path d="M15 5l2 4" />
                            </svg>
                        </span>
                        <span>Movie</span>
                    </button>

                    {/* Series pill – disabled / coming soon */}
                    <button
                        type="button"
                        disabled
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-900/40 text-[10px] text-zinc-500 cursor-not-allowed"
                    >
                        {/* TV icon (same style as TopBar) */}
                        <span className="h-3.5 w-3.5">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="3" y="5" width="18" height="12" rx="2" />
                                <path d="M8 3l4 4 4-4" />
                            </svg>
                        </span>
                        <span>Series soon</span>
                    </button>
                </div>

                {/* Search form */}
                <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Type a movie (e.g. Iron Man)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full rounded-full bg-zinc-900/80 border border-zinc-700/70 px-3 pr-7 py-1.5 text-xs outline-none placeholder:text-zinc-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/60"
                        />
                        {/* Clear button inside input */}
                        {hasQuery && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="absolute inset-y-0 right-1.5 my-auto flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/70"
                                aria-label="Clear search"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="rounded-full bg-linear-to-r from-pink-500 to-purple-500 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide hover:opacity-90 disabled:opacity-50"
                        disabled={isSearching}
                    >
                        {isSearching ? "..." : "Recommend"}
                    </button>
                </form>

                {/* Error message */}
                {error && (
                    <div className="mb-2 text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-2xl px-3 py-2">
                        {error}
                    </div>
                )}

                {/* Results / helper text */}
                <div className="max-h-48 md:max-h-64 overflow-y-auto space-y-2 mt-1">
                    {isSearching && (
                        <div className="text-[11px] text-zinc-400">Searching…</div>
                    )}

                    {/* When no query, just show helper text, even if old recommendations exist */}
                    {!isSearching && !hasQuery && (
                        <div className="text-[11px] text-zinc-500">
                            Type a movie title and hit Recommend to see up to 5 similar
                            movies.
                        </div>
                    )}

                    {/* Show recommendations only when there is a query */}
                    {!isSearching &&
                        hasQuery &&
                        recommendations &&
                        recommendations.length === 0 && (
                            <div className="text-[11px] text-zinc-500">
                                No similar movies found for that title.
                            </div>
                        )}

                    {!isSearching &&
                        hasQuery &&
                        recommendations &&
                        recommendations.map((rec, idx) => (
                            <button
                                key={`${rec.title}-${idx}`}
                                type="button"
                                onClick={() => onPick(rec)}
                                className="w-full text-left rounded-2xl bg-zinc-900/80 border border-zinc-700/70 px-3 py-2 hover:border-zinc-300 hover:bg-zinc-900 transition"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-zinc-50">
                                        {rec.title}
                                    </span>
                                    {/* TMDB rating instead of similarity score */}
                                    {rec.rating !== undefined && rec.rating !== null && (
                                        <span className="text-[10px] text-zinc-400">
                                            TMDB {Number(rec.rating).toFixed(1)}/10
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                </div>
            </div>
        </div>
    );
}

