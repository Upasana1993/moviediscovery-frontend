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
  const [loadingAI, setLoadingAI] = useState(false);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    if (!API) return;

    fetch(`${API}/trending`).then((r) => r.json()).then(setTrending);
    fetch(`${API}/latest`).then((r) => r.json()).then(setLatest);
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

  const Row = ({ title, movies }) => (
    <>
      <h2 className="row-title">{title}</h2>
      <div className="row">
        {movies.map((movie) => (
          <div className="card" key={movie.id}>
            <button
              className={`heart ${
                watchlist.some((m) => m.id === movie.id)
                  ? "active"
                  : ""
              }`}
              onClick={() => toggleWatchlist(movie)}
            >
              ❤️
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
                  <img src="/netflix.png" alt="Netflix" />
                )}
                {movie.providers?.prime && (
                  <img src="/prime.png" alt="Prime Video" />
                )}
                {movie.providers?.bookmyshow && (
                  <img src="/bms.png" alt="BookMyShow" />
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
      <nav className="nav">
        <div className="logo">🎬 MovieDiscovery</div>
        <div>❤️ Watchlist ({watchlist.length})</div>
      </nav>

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

      {aiPicks.length > 0 && (
        <Row title="🎯 AI Picks" movies={aiPicks} />
      )}
      <Row title="🔥 Trending" movies={trending} />
      <Row title="🆕 Latest Releases" movies={latest} />
    </div>
  );
}
