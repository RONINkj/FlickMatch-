// src/components/PosterWall.jsx
// Poster wall with progressive loading, shuffle support, and 2D floating effect (Option B – medium strength).

import React, { useEffect, useRef, useState } from "react";
import PosterTile from "./PosterTile";

export default function PosterWall({
    onSelect,
    onLock,
    shuffleToken,
    onShuffleComplete,
}) {
    const [display, setDisplay] = useState([]);
    const [allFetchedCount, setAllFetchedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasJustShuffled, setHasJustShuffled] = useState(false);

    const wallRef = useRef(null);

    const PAGE_SIZE = 200; // request pages of this size
    const PAGE_INTERVAL = 250; // ms between page fetches
    const DESIRED_TOTAL = 4802; // ideal if possible
    const API_BASE = import.meta.env.VITE_API_URL || "https://flickmatch-backend.onrender.com/api";
;

    // cache + offsets for pagination/shuffle
    const fetchedOffsets = useRef(new Set());
    const allMoviesCache = useRef([]); // caches fetched items so we can rotate

    // ---------- FLOATING CONFIG (Option B: medium) ----------
    const FLOAT_MOUSE_X = 25; // max px drift from mouse horizontally
    const FLOAT_MOUSE_Y = 18; // max px drift from mouse vertically
    const IDLE_FLOAT_X = 10; // idle orbit amplitude X
    const IDLE_FLOAT_Y = 10; // idle orbit amplitude Y
    const FLOAT_SMOOTH = 0.08; // 0–1, higher = snappier

    const floatTarget = useRef({ x: 0, y: 0 });
    const floatCurrent = useRef({ x: 0, y: 0 });
    const [floatStyle, setFloatStyle] = useState({
        transform: "translate3d(0px, 0px, 0px)",
    });
    const floatRafId = useRef(null);

    // helper so shuffle can apply new posters + signal completion + fade
    const applyNewDisplay = (newDisplay) => {
        setDisplay(newDisplay);
        setHasJustShuffled(true);

        if (onShuffleComplete) {
            onShuffleComplete();
        }

        // clear fade flag after animation
        setTimeout(() => {
            setHasJustShuffled(false);
        }, 500);
    };

    // fetch a page (limit + offset)
    async function fetchPage(limit, offset) {
        const url = `${API_BASE}/api/wall-movies?limit=${limit}&offset=${offset}`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        return res;
    }

    // ---------- DATA FETCH / PROGRESSIVE LOADING ----------
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        setDisplay([]);
        allMoviesCache.current = [];
        fetchedOffsets.current = new Set();

        const doFetchPages = async () => {
            try {
                // first small fast page to render quickly
                let pageOffset = 0;
                const initialLimit = Math.min(60, PAGE_SIZE);
                const resInit = await fetchPage(initialLimit, pageOffset);
                if (!resInit.ok) {
                    const txt = await resInit.text();
                    throw new Error(
                        `API ${resInit.status} ${resInit.statusText} - preview: ${txt.slice(
                            0,
                            300
                        )}`
                    );
                }
                const jsonInit = await resInit.json();
                if (!Array.isArray(jsonInit)) {
                    throw new Error("API did not return an array on initial load");
                }

                allMoviesCache.current.push(...jsonInit);
                setDisplay((d) => d.concat(jsonInit));
                pageOffset += jsonInit.length;
                fetchedOffsets.current.add(0);
                setAllFetchedCount(allMoviesCache.current.length);

                // then continue fetching additional pages progressively up to DESIRED_TOTAL
                while (!cancelled && allMoviesCache.current.length < DESIRED_TOTAL) {
                    const offset = pageOffset;
                    if (fetchedOffsets.current.has(offset)) break; // already fetched

                    const res = await fetchPage(PAGE_SIZE, offset);
                    if (res.status === 422) {
                        console.warn(
                            "PosterWall: backend returned 422 on fetchPage. Stopping further page fetches."
                        );
                        break;
                    }
                    if (!res.ok) {
                        const txt = await res.text();
                        throw new Error(
                            `API ${res.status} ${res.statusText} - preview: ${txt.slice(
                                0,
                                300
                            )}`
                        );
                    }
                    const pageJson = await res.json();
                    if (!Array.isArray(pageJson)) break;

                    const newItems = pageJson.filter(
                        (it) => !allMoviesCache.current.find((x) => x.movie_id === it.movie_id)
                    );

                    if (newItems.length > 0) {
                        allMoviesCache.current.push(...newItems);
                        setDisplay((d) => d.concat(newItems));
                        setAllFetchedCount(allMoviesCache.current.length);
                    } else {
                        console.warn(
                            "PosterWall: fetched page had zero new unique items; stopping."
                        );
                        break;
                    }

                    fetchedOffsets.current.add(offset);
                    pageOffset += pageJson.length;
                    if (pageJson.length < PAGE_SIZE) break;

                    await new Promise((r) => setTimeout(r, PAGE_INTERVAL));
                }

                if (!cancelled) {
                    setLoading(false);
                }
            } catch (err) {
                console.error("PosterWall fetch error:", err);
                if (cancelled) return;
                setError(err.message || "Failed to load posters");
                setLoading(false);
            }
        };

        doFetchPages();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [API_BASE]);

    // ---------- SHUFFLE BEHAVIOUR ----------
    useEffect(() => {
        if (shuffleToken === undefined) return;

        const runShuffle = async () => {
            // try backend random page first
            try {
                const tryRandomOffset = Math.floor(Math.random() * 1000) * PAGE_SIZE;
                const res = await fetch(
                    `${API_BASE}/api/wall-movies?limit=${PAGE_SIZE}&offset=${tryRandomOffset}`,
                    { headers: { Accept: "application/json" } }
                );
                if (res.ok) {
                    const json = await res.json();
                    if (Array.isArray(json) && json.length > 0) {
                        applyNewDisplay(json);

                        const uniques = json.filter(
                            (it) =>
                                !allMoviesCache.current.find((x) => x.movie_id === it.movie_id)
                        );
                        if (uniques.length > 0) {
                            allMoviesCache.current.push(...uniques);
                        }
                        return;
                    }
                }
            } catch (e) {
                console.warn(
                    "PosterWall shuffle backend attempt failed, falling back to client rotation",
                    e
                );
            }

            // fallback: rotate window inside cached items
            if (allMoviesCache.current.length <= 0) {
                if (onShuffleComplete) onShuffleComplete();
                return;
            }

            const total = allMoviesCache.current.length;
            const windowSize = Math.min(total, 120);
            const start = Math.floor(Math.random() * Math.max(1, total - windowSize));
            const newWindow = allMoviesCache.current.slice(
                start,
                start + windowSize
            );

            applyNewDisplay(newWindow);
        };

        runShuffle();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shuffleToken]);

    // ---------- FLOATING EFFECT (2D translate only) ----------
    useEffect(() => {
        const handleMouseMove = (e) => {
            const vw = window.innerWidth || 1;
            const vh = window.innerHeight || 1;

            const normX = (e.clientX / vw - 0.5) * 2; // -1 .. 1
            const normY = (e.clientY / vh - 0.5) * 2;

            floatTarget.current = {
                x: normX * FLOAT_MOUSE_X,
                y: normY * FLOAT_MOUSE_Y,
            };
        };

        window.addEventListener("mousemove", handleMouseMove);

        let start = performance.now();

        const animate = (now) => {
            const t = (now - start) / 1000;

            // idle orbit
            const idleX = Math.sin(t / 4) * IDLE_FLOAT_X;
            const idleY = Math.cos(t / 3) * IDLE_FLOAT_Y;

            const targetX = floatTarget.current.x + idleX;
            const targetY = floatTarget.current.y + idleY;

            const current = floatCurrent.current;
            const nextX = current.x + (targetX - current.x) * FLOAT_SMOOTH;
            const nextY = current.y + (targetY - current.y) * FLOAT_SMOOTH;

            floatCurrent.current = { x: nextX, y: nextY };

            setFloatStyle({
                transform: `translate3d(${nextX.toFixed(2)}px, ${nextY.toFixed(
                    2
                )}px, 0px)`,
            });

            floatRafId.current = requestAnimationFrame(animate);
        };

        floatRafId.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (floatRafId.current) cancelAnimationFrame(floatRafId.current);
        };
    }, []);

    // ---------- RENDER ----------
    if (loading && display.length === 0) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-zinc-400">
                <div className="h-10 w-10 rounded-full border-2 border-zinc-700 border-t-pink-500 animate-spin" />
                <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                    Loading posters…
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[40vh] flex items-center justify-center text-red-400">
                Error loading poster wall: {error}
            </div>
        );
    }

    return (
        <section
            className="poster-wall relative px-6 md:px-12 pt-8 pb-28"
            ref={wallRef}
        >
            {/* Helper hint card */}
            <div className="absolute top-20 left-6 z-20 max-w-sm pointer-events-none">
                <div className="bg-zinc-900/60 border border-zinc-800 px-4 py-3 rounded-2xl backdrop-blur-sm text-zinc-300 text-sm">
                    <strong className="text-xs text-pink-400 block mb-1">
                        FLICKMATCH
                    </strong>
                    Hover over a poster or click a recommended movie to see details here.
                </div>
            </div>

            {/* Floating wrapper + fade on shuffle */}
            <div
                style={floatStyle}
                className={`transition-transform duration-150 will-change-transform ${hasJustShuffled ? "animate-wall-fade" : ""
                    }`}
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-fr">
                    {display.map((m) => (
                        <div key={m.movie_id || m.title} className="w-full">
                            <PosterTile
                                movie={m}
                                onHover={(movie) => onSelect && onSelect(movie)}
                                onClick={(movie) => onLock && onLock(movie)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        .poster-wall img {
          will-change: transform, opacity;
          backface-visibility: hidden;
        }
        @media (min-width: 1024px) {
          .poster-wall {
            padding-left: 96px;
          }
        }
      `}</style>
        </section>
    );
}
