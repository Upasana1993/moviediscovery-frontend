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
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [selected, setSelected] = useState(null);

  const [loadingAI, setLoadingAI] = useState(false);
  const [backendAwake, setBackendAwake] = useState(false);
  const [showWakeBanner, setShowWakeBanner] = useState(true);

  /* ---------------- WAKE BACKEND ---------------- */
  const wakeBackend = async () => {
    try {
      const res = await fetch(`${API}/trending`);
      const data = await res.json();
      setTrending(data);
      setBackendAwake(true);
      setShowWakeBanner(false);

      const latestRes = await fetch(`${API}/latest`);
      setLatest(await latestRes.json());
    } catch {
      // backend still sleeping
    }
  };

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    if (!API) return;
    wakeBackend();
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
    } catch {
      alert("Backend is waking up. Please try again.");
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
      <h2>{title}</h2>
      <div className="row">
        {movies.map((movie) => (
          <div
            className="card"
            key={movie.id}
            onClick={() => setSelected(movie)}
          >
            <button
              className="heart"
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(movie);
              }}
            >
              {isInWatchlist(movie) ? "❤️" : "🤍"}
            </button>

            <img
              src={movie.poster || "/placeholder.png"}
              alt={movie.title}
            />

            <div className="card-info">
              <h4>{movie.title}</h4>

              {movie.rating && (
                <span>⭐ {movie.rating.toFixed(1)}</span>
              )}

              <p>{movie.overview?.slice(0, 90)}…</p>

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
      <nav>
        <span>🎬 MovieDiscovery</span>
        <button onClick={() => setShowWatchlist(true)}>
          ❤️ Watchlist ({watchlist.length})
        </button>
      </nav>

      {/* WAKE SERVER BANNER */}
      {showWakeBanner && (
        <div className="wake-banner">
          <span>
            Frontend preview only. Please wake servers to enable backend
            functionality.
          </span>
          <button onClick={wakeBackend}>Wake up servers</button>
        </div>
      )}

      {/* AI SEARCH */}
      <section className="ai">
        <div className="search">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI for movie recommendations"
            style={{ background: "#fff", color: "#000" }}
          />
          <button onClick={askAI} disabled={!backendAwake || loadingAI}>
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

      {aiPicks.length > 0 && <Row title="🎯 AI Picks" movies={aiPicks} />}
      {trending.length > 0 && <Row title="🔥 Trending" movies={trending} />}
      {latest.length > 0 && <Row title="🆕 Latest" movies={latest} />}

      {/* WATCHLIST MODAL */}
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

      {/* MOVIE DETAILS MODAL */}
      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div
            className="modal-box movie-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.poster || "/placeholder.png"}
              alt={selected.title}
              className="movie-modal-poster"
            />

            <h2>{selected.title}</h2>

            {selected.rating && (
              <div className="movie-rating">
                ⭐ {selected.rating.toFixed(1)}
              </div>
            )}

            <p className="movie-overview">{selected.overview}</p>

            <div className="providers movie-providers">
              {selected.providers?.netflix && (
                <a
                  href={`https://www.netflix.com/search?q=${encodeURIComponent(
                    selected.title
                  )}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <img src="/netflix.png" alt="Netflix" />
                </a>
              )}

              {selected.providers?.prime && (
                <a
                  href={`https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(
                    selected.title
                  )}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <img src="/prime.png" alt="Prime Video" />
                </a>
              )}

              {selected.providers?.bookmyshow && (
                <a
                  href={`https://in.bookmyshow.com/explore/movies?q=${encodeURIComponent(
                    selected.title
                  )}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <img src="/bms.png" alt="BookMyShow" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
