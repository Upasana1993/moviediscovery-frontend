import { useEffect, useState } from "react";
import "./App.css";

const API = process.env.REACT_APP_API_BASE_URL;

const PROMPTS = [
  "Baby-friendly movies",
  "Date night movies",
  "Sunday family movies",
  "Feel-good movies",
  "Thrillers under 2 hours",
  "Movies like Interstellar",
];

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [aiPicks, setAiPicks] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    if (!API) return;

    fetch(`${API}/trending`)
      .then((r) => r.json())
      .then(setTrending)
      .catch(console.error);

    fetch(`${API}/latest`)
      .then((r) => r.json())
      .then(setLatest)
      .catch(console.error);
  }, []);

  /* ---------------- ASK AI ---------------- */
  const askAI = async () => {
    if (!prompt.trim()) return;

    setLoadingAI(true);
    setAiPicks([]);

    try {
      const res = await fetch(`${API}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setAiPicks(Array.isArray(data.results) ? data.results : []);
    } catch (e) {
      console.error(e);
      alert("AI failed. Try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  /* ---------------- WATCHLIST ---------------- */
  const toggleWatchlist = (movie) => {
    setWatchlist((prev) =>
      prev.some((m) => m.id === movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, movie]
    );
  };

  const isInWatchlist = (movie) =>
    watchlist.some((m) => m.id === movie.id);

  /* ---------------- MOVIE ROW ---------------- */
  const Row = ({ title, movies }) => (
    <>
      <h2 className="row-title">{title}</h2>
      <div className="row">
        {movies.map((movie) => (
          <div
            className="card"
            key={movie.id}
            onClick={() => setSelected(movie)}
          >
            {/* WATCHLIST HEART */}
            <button
              className={`heart ${isInWatchlist(movie) ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(movie);
              }}
            >
              {isInWatchlist(movie) ? "❤️" : "🤍"}
            </button>

            {/* POSTER */}
            <img
              src={movie.poster || "/placeholder.png"}
              alt={movie.title}
            />

            {/* INFO */}
            <div className="card-info">
              <h4>{movie.title}</h4>

              {movie.rating && (
                <span>⭐ {movie.rating.toFixed(1)}</span>
              )}

              <p>{movie.overview?.slice(0, 90)}…</p>

              {/* PROVIDERS */}
              <div className="providers">
                {movie.providers?.netflix && (
                  <a
                    href={`https://www.netflix.com/search?q=${encodeURIComponent(
                      movie.title
                    )}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img src="/netflix.png" alt="Netflix" />
                  </a>
                )}

                {movie.providers?.prime && (
                  <a
                    href={`https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(
                      movie.title
                    )}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img src="/prime.png" alt="Prime Video" />
                  </a>
                )}

                {movie.providers?.bookmyshow && (
                  <a
                    href={`https://in.bookmyshow.com/explore/movies?q=${encodeURIComponent(
                      movie.title
                    )}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img src="/bms.png" alt="BookMyShow" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="app">
      {/* NAV */}
      <nav className="nav">
        <div className="logo">🎬 MovieDiscovery</div>
        <div>❤️ Watchlist ({watchlist.length})</div>
      </nav>

      {/* AI SEARCH */}
      <section className="ai">
        <h1>AI Movie Recommender</h1>

        <div className="search">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Picnic movies with friends"
          />
          <button onClick={askAI} disabled={loadingAI}>
            {loadingAI ? "Thinking..." : "Ask AI"}
          </button>
        </div>

        <div className="chips">
          {PROMPTS.map((p) => (
            <button key={p} onClick={() => setPrompt(p)}>
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* ROWS */}
      {aiPicks.length > 0 && (
        <Row title="🎯 AI Picks" movies={aiPicks} />
      )}
      <Row title="🔥 Trending" movies={trending} />
      <Row title="🆕 Latest Releases" movies={latest} />


      {/* WATCHLIST MODAL ✅ */}
      {showWatchlist && (
        <div className="modal" onClick={() => setShowWatchlist(false)}>
          <div
            className="modal-box watchlist-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Your Watchlist</h2>

            {watchlist.length === 0 && <p>No movies yet.</p>}

            {watchlist.map((m) => (
              <div
                key={m.id}
                className="watchlist-item"
                onClick={() => {
                  setSelected(m);
                  setShowWatchlist(false);
                }}
              >
                <img
                  src={m.poster || "/placeholder.png"}
                  alt={m.title}
                />
                <span>{m.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MOVIE MODAL */}
      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.poster || "/placeholder.png"}
              alt={selected.title}
            />
            <div>
              <h2>{selected.title}</h2>
              <p>{selected.overview}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
