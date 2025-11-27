// src/App.jsx
import { useEffect, useState } from "react";
import LoadingScreen from "./components/LoadingScreen.jsx";
import TopBar from "./components/TopBar.jsx";
import PosterWall from "./components/PosterWall.jsx";
import MovieCard from "./components/MovieCard.jsx";
import SearchPanel from "./components/SearchPanel.jsx";
import MovieDetailsModal from "./components/MovieDetailsModel.jsx";
import { getRecommendations, getMovieDetails } from "./api/flickmatch.js";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsMovie, setDetailsMovie] = useState(null);

  const [isLocked, setIsLocked] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);

  // fake loading screen for 2s
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Hover from PosterWall – only when not locked & search/modal closed
  const handlePosterHover = (movie) => {
    if (isLocked || isSearchOpen || isDetailsOpen) return;
    setSelectedMovie({
      ...movie,
      source: "poster",
    });
  };

  // Click on poster – lock selection
  const handlePosterLock = (movie) => {
    setIsLocked(true);
    setSelectedMovie({
      ...movie,
      source: "poster",
    });
  };

  const handleUnselect = () => {
    setIsLocked(false);
  };

  // Recommendations search
  const handleSearch = async (title) => {
    if (!title.trim()) return;
    setIsSearching(true);
    setSearchError("");
    try {
      const data = await getRecommendations(title.trim());
      setRecommendations(data || []);
      if (!data || data.length === 0) {
        setSearchError("No similar movies found for that title.");
      }
    } catch (err) {
      console.error(err);
      setSearchError("Could not fetch recommendations. Check backend.");
    } finally {
      setIsSearching(false);
    }
  };

  // clear recommendations (used by SearchPanel clear-X)
  const handleClearSearch = () => {
    setRecommendations([]);
    setSearchError("");
  };

  // Picking a recommended movie
  const handlePickRecommendation = async (rec) => {
    try {
      if (!rec.movie_id) {
        const fallback = {
          movie_id: null,
          title: rec.title,
          overview: null,
          genres: [],
          year: null,
          poster_url: null,
          rating: null,
          runtime: null,
          tmdb_url: null,
          source: "recommendation",
        };
        setSelectedMovie(fallback);
        setDetailsMovie(fallback);
        setIsLocked(false);
        return;
      }

      const details = await getMovieDetails(rec.movie_id);
      const merged = {
        ...details,
        source: "recommendation",
      };

      setSelectedMovie(merged);
      setDetailsMovie(merged);
      setIsLocked(false);
    } catch (err) {
      console.error("Error fetching movie details:", err);
      const fallback = {
        movie_id: rec.movie_id ?? null,
        title: rec.title,
        overview: null,
        genres: [],
        year: null,
        poster_url: null,
        rating: null,
        runtime: null,
        tmdb_url: null,
        source: "recommendation",
      };
      setSelectedMovie(fallback);
      setDetailsMovie(fallback);
      setIsLocked(false);
    }
  };

  // More details modal (unified path)
  const handleOpenDetails = async (movie) => {
    const target = movie || selectedMovie;
    if (!target) return;

    if (
      target.movie_id &&
      detailsMovie &&
      detailsMovie.movie_id === target.movie_id
    ) {
      setIsDetailsOpen(true);
      return;
    }

    if (target.movie_id) {
      try {
        const full = await getMovieDetails(target.movie_id);
        const payload = {
          ...full,
          source: target.source || "poster",
        };
        setDetailsMovie(payload);
        setIsDetailsOpen(true);
      } catch (err) {
        console.error("Failed to fetch full movie details:", err);
        setDetailsMovie(target);
        setIsDetailsOpen(true);
      }
    } else {
      setDetailsMovie(target);
      setIsDetailsOpen(true);
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  // Shuffle wall
  const handleShuffleWall = () => {
    setIsShuffling(true);
    setShuffleKey((k) => k + 1);
  };

  const handleShuffleComplete = () => {
    setIsShuffling(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const cardPositionClass =
    "fixed bottom-2 left-2 right-2 md:bottom-6 md:left-6 md:right-6 lg:bottom-auto lg:top-28 lg:left-10 lg:right-auto";

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <TopBar
          onSearchClick={() => setIsSearchOpen(true)}
          onShuffleClick={handleShuffleWall}
          isShuffling={isShuffling}
        />
      </div>

      {/* Main content; allow vertical scroll */}
      <div className="pt-16 min-h-screen relative overflow-x-hidden">
        <PosterWall
          onSelect={handlePosterHover}
          onLock={handlePosterLock}
          shuffleToken={shuffleKey}
          onShuffleComplete={handleShuffleComplete}
        />

        {/* Big Movie Card */}
        <div className={`pointer-events-none ${cardPositionClass} max-w-xl z-30`}>
          <MovieCard
            movie={selectedMovie}
            onMoreDetails={handleOpenDetails}
            isLocked={isLocked}
            onUnselect={handleUnselect}
          />
        </div>

        {/* Search panel overlay */}
        <SearchPanel
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSearch={handleSearch}
          recommendations={recommendations}
          isSearching={isSearching}
          error={searchError}
          onPick={handlePickRecommendation}
          onClearResults={handleClearSearch}
        />

        {/* Movie details modal */}
        <MovieDetailsModal
          movie={detailsMovie}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
        />
      </div>
    </div>
  );
}

export default App;
