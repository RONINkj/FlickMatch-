// src/components/TopBar.jsx
import React from "react";

export default function TopBar({ onSearchClick, onShuffleClick, isShuffling }) {
    const shuffleIconClasses = `h-4 w-4 transition-transform duration-300 ${isShuffling ? "animate-spin" : "group-hover:-rotate-6 group-active:scale-95"
        }`;

    const shuffleIconStyle = isShuffling ? { animationDuration: "1.1s" } : undefined;

    return (
        <header className="w-full bg-black/80 backdrop-blur-lg border-b border-zinc-900 px-4 md:px-8 py-3 flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
                <img
                    src="/FlickMatch_logo.png"
                    alt="FlickMatch logo"
                    className="h-8 w-8 rounded-lg shadow-md shadow-black/70"
                />
                <div className="flex flex-col leading-tight">
                    <span className="text-sm md:text-base font-semibold text-white">
                        FlickMatch
                    </span>
                    <span className="text-[11px] tracking-[0.22em] text-zinc-400 uppercase">
                        Movie &amp; Series Recommender
                    </span>
                </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 md:gap-3">
                {/* Shuffle button */}
                <button
                    type="button"
                    onClick={onShuffleClick}
                    aria-label="Shuffle posters"
                    className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/70 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-400 transition-colors"
                >
                    {/* Burst / ping particles while shuffling */}
                    {isShuffling && (
                        <>
                            <span className="pointer-events-none absolute inline-flex h-9 w-9 rounded-full bg-pink-500/25 animate-ping" />
                            <span className="pointer-events-none absolute inline-flex h-6 w-6 rounded-full bg-purple-500/20 animate-ping delay-150" />
                        </>
                    )}

                    <span
                        className={shuffleIconClasses}
                        style={shuffleIconStyle}
                    >
                        {/* Boxicons bx-shuffle */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M17 3h4v4" />
                            <path d="M3 7h4.5c2.5 0 3.5 1 5.5 3l1 1" />
                            <path d="M17 21h4v-4" />
                            <path d="M3 17h4.5c2.5 0 3.5-1 5.5-3l1-1" />
                            <path d="M21 7l-4 4" />
                            <path d="M21 17l-4-4" />
                        </svg>
                    </span>
                </button>

                {/* Search button */}
                <button
                    type="button"
                    onClick={onSearchClick}
                    aria-label="Open search"
                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/70 text-zinc-100 hover:bg-zinc-800 hover:border-pink-500 transition-colors"
                >
                    <span className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
                        {/* Boxicons bx-search */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="6" />
                            <line x1="16.5" y1="16.5" x2="20" y2="20" />
                        </svg>
                    </span>
                </button>
            </div>
        </header>
    );
}
