import { useEffect, useState } from "react";
import "./App.css";

const API = process.env.REACT_APP_API_BASE_URL;

export default function App() {
  const [aiPicks, setAiPicks] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const [watchlist, setWatchlist] = useState([]);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API}/trending`).then(r => r.json()).then(setTrending);
    fetch(`${API}/latest`).then(r => r.json()).then(setLatest);
  }, []);

  const askAI = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const res = await fetch(`${API}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setAiPicks(data.results || []);
    setLoading(false);
  };

  const toggleWatchlist = (movie) => {
    setWatchlist((prev) =>
      prev.some((m) => m.id === movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, movie]
    );
  };

  const Row = ({ title, movies }) => (
    <>
      <h2>{title}</h2>
      <div className="row">
        {movies.map((m) => (
          <div className="card" key={m.id} onClick={() => setSelected(m)}>
            <button
              className="heart"
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(m);
              }}
            >
              ❤️
            </button>

            <img src={m.poster || "/placeholder.png"} />
            <h4>{m.title}</h4>

            <div className="providers">
              {m.providers?.netflix && (
                <a
                  href={`https://www.netflix.com/search?q=${encodeURIComponent(
                    m.title
                  )}`}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src="/netflix.png" />
                </a>
              )}
              {m.providers?.prime && (
                <a
                  href={`https://www.primevideo.com/search?phrase=${encodeURIComponent(
                    m.title
                  )}`}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src="/prime.png" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="app">
      <nav>
        <span>🎬 MovieDiscovery</span>
        <button onClick={() => setShowWatchlist(true)}>
          ❤️ Watchlist ({watchlist.length})
        </button>
      </nav>

      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask AI..."
      />
      <button onClick={askAI}>
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {aiPicks.length > 0 && <Row title="🎯 AI Picks" movies={aiPicks} />}
      <Row title="🔥 Trending" movies={trending} />
      <Row title="🆕 Latest" movies={latest} />

      {/* MOVIE MODAL */}
      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="modal-box">
            <img src={selected.poster} />
            <h2>{selected.title}</h2>
            <p>{selected.overview}</p>
          </div>
        </div>
      )}

      {/* WATCHLIST MODAL */}
      {showWatchlist && (
        <div className="modal" onClick={() => setShowWatchlist(false)}>
          <div className="modal-box">
            <h2>Your Watchlist</h2>
            {watchlist.map((m) => (
              <p key={m.id}>{m.title}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
