import { useEffect, useState } from "react";
import "./App.css";

const IMG = "https://image.tmdb.org/t/p/w500";
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
  const [showWatchlist, setShowWatchlist] = useState(false);
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
  if (!prompt.trim() || !API) return;

  setLoadingAI(true);
  setAiPicks([]);

  try {
    const res = await fetch(`${API}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    console.log("AI response:", data);

    // ✅ THIS LINE FIXES EVERYTHING
    setAiPicks(Array.isArray(data.results) ? data.results : []);
  } catch (e) {
    console.error(e);
    alert("AI failed. Please try again.");
  } finally {
    setLoadingAI(false);
  }
};


  /* ---------------- WATCHLIST ---------------- */
  const toggleWatchlist = (movie) => {
    setWatchlist((prev) =>
      prev.some((m) =>
        m.id ? m.id === movie.id : m.title === movie.title
      )
        ? prev.filter((m) =>
            m.id ? m.id !== movie.id : m.title !== movie.title
          )
        : [...prev, movie]
    );
  };

  const isInWatchlist = (movie) =>
    watchlist.some((m) =>
      m.id ? m.id === movie.id : m.title === movie.title
    );

  /* ---------------- MOVIE ROW ---------------- */
  const Row = ({ title, movies }) => (
    <>
      <h2 className="row-title">{title}</h2>
      <div className="row">
        {movies.map((movie, i) => (
          <div
            className="card"
            key={movie.id || movie.title || i}
            onClick={() => setSelected(movie)}
          >
            <button
              className={`heart ${isInWatchlist(movie) ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(movie);
              }}
            >
              {isInWatchlist(movie) ? "❤️" : "🤍"}
            </button>

            <img
              src={
                movie.poster_path
                  ? IMG + movie.poster_path
                  : "/placeholder.png"
              }
              alt={movie.title}
            />

            <div className="card-info">
              <h4>{movie.title}</h4>
              {movie.vote_average && (
                <span>⭐ {movie.vote_average.toFixed(1)}</span>
              )}
              <p>{movie.overview?.slice(0, 90)}…</p>

              <div className="providers">
                <a
                  href={`https://www.netflix.com/search?q=${movie.title}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src="/netflix.png" alt="Netflix" />
                </a>

                <a
                  href={`https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${movie.title}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src="/prime.png" alt="Prime" />
                </a>

                {movie.release_date &&
                  new Date(movie.release_date) >
                    new Date(
                      Date.now() - 45 * 24 * 60 * 60 * 1000
                    ) && (
                    <a
                      href={`https://in.bookmyshow.com/explore/movies?q=${movie.title}`}
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
      {/* NAVBAR */}
      <nav className="nav">
        <div className="logo">🎬 MovieDiscovery</div>
        <button
          className="watchlist-btn"
          onClick={() => setShowWatchlist(true)}
        >
          ❤️ Watchlist ({watchlist.length})
        </button>
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

      {aiPicks.length > 0 && <Row title="🎯 AI Picks" movies={aiPicks} />}
      <Row title="🔥 Trending" movies={trending} />
      <Row title="🆕 Latest Releases" movies={latest} />

      {/* MOVIE MODAL */}
      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <img
              src={
                selected.poster_path
                  ? IMG + selected.poster_path
                  : "/placeholder.png"
              }
              alt={selected.title}
            />
            <div>
              <h2>{selected.title}</h2>
              <p>{selected.overview}</p>
            </div>
          </div>
        </div>
      )}

      {/* WATCHLIST MODAL */}
      {showWatchlist && (
        <div className="modal" onClick={() => setShowWatchlist(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Your Watchlist</h2>
            {watchlist.length === 0 && <p>No movies yet.</p>}
            <div className="row">
              {watchlist.map((m, i) => (
                <div className="card" key={m.id || m.title || i}>
                  <img
                    src={
                      m.poster_path
                        ? IMG + m.poster_path
                        : "/placeholder.png"
                    }
                    alt={m.title}
                  />
                  <h4>{m.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
