// src/components/PosterTile.jsx
// Individual poster tile: float animation, hover zoom, pause-on-hover, click/select.
// Drop into src/components/PosterTile.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";

export default function PosterTile({
    movie,
    onHover = () => { },
    onClick = () => { },
    isLockedMode = false, // if the wall is in locked/select mode this tile may behave differently
}) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const tileRef = useRef(null);

    // Randomize per-tile animation settings so the wall looks alive
    const floatProps = useMemo(() => {
        const dur = 8 + Math.random() * 8; // 8 - 16s
        const delay = Math.random() * 6; // 0 - 6s
        const xAmp = (Math.random() - 0.5) * 2; // small horizontal wiggle
        const yAmp = 3 + Math.random() * 5; // 3 - 8px vertical amplitude
        const rotate = (Math.random() - 0.5) * 2; // small degrees
        return { dur: dur.toFixed(2), delay: delay.toFixed(2), xAmp, yAmp, rotate: rotate.toFixed(2) };
    }, [movie]);

    // Pause animation on hover (for readability)
    useEffect(() => {
        const el = tileRef.current;
        if (!el) return;
        const onEnter = () => (el.style.animationPlayState = "paused");
        const onLeave = () => (el.style.animationPlayState = "running");
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
        return () => {
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    const posterUrl = movie.poster_url || movie.posterPath || movie.poster || "";

    const handleMouseEnter = () => {
        onHover(movie);
    };
    const handleMouseLeave = () => {
        onHover(null);
    };
    const handleClick = (e) => {
        onClick(movie);
    };

    return (
        <div
            ref={tileRef}
            className="poster-tile group relative w-full select-none cursor-pointer"
            style={{
                // inline style to vary animation timing per tile
                animation: `poster-float ${floatProps.dur}s ease-in-out ${floatProps.delay}s infinite alternate`,
                transformOrigin: "center center",
                willChange: "transform, opacity",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <div
                className="poster-inner rounded-xl overflow-hidden transform-gpu transition-all duration-220"
                style={{
                    // subtle scale-up on hover via tailwind classes below
                }}
            >
                {/* image */}
                <img
                    src={posterUrl}
                    alt={movie.title || movie.name || "poster"}
                    loading="lazy"
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgLoaded(true)}
                    className={`w-full h-[360px] object-cover block transition-transform duration-220 ease-out group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0 blur-sm"}`}
                    style={{ borderRadius: "10px" }}
                />
            </div>

            {/* small badge in top-right if needed */}
            <div className="absolute top-3 right-3 pointer-events-none">
                {movie.rating ? (
                    <div className="text-xs bg-zinc-900/60 backdrop-blur-sm px-2 py-1 rounded-full border border-zinc-700 text-zinc-100">
                        TMDB {Math.round(movie.rating * 10) / 10}/10
                    </div>
                ) : null}
            </div>

            <style>{`
        .poster-tile { transform-origin:center; }
        .poster-inner { box-shadow: 0 6px 18px rgba(0,0,0,0.6); }
        .poster-tile:hover .poster-inner { transform: translateY(-6px) scale(1.04); box-shadow: 0 18px 40px rgba(0,0,0,0.6); z-index: 60; }
        @keyframes poster-float {
          0% { transform: translate3d(0, 0px, 0) rotate(0.0deg); }
          100% { transform: translate3d(${floatProps.xAmp}px, ${floatProps.yAmp}px, 0) rotate(${floatProps.rotate}deg); }
        }
        /* mobile touch: don't run hover transform (touch devices will use select) */
        @media (hover: none) {
          .poster-tile:hover .poster-inner { transform: none; box-shadow: 0 6px 18px rgba(0,0,0,0.6); }
        }
      `}</style>
        </div>
    );
}
