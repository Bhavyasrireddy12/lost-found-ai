
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  BrainCircuit,
  Image as ImageIcon,
  MapPin,
  CalendarDays,
  Clock3,
  Sparkles,
  Package,
  Target,
  FileText,
  Layers3,
  RefreshCw,
} from "lucide-react";

import api, { imageUrl } from "./api/axios";

function getScore(value) {
  const score = Number(value ?? 0);

  if (!Number.isFinite(score)) return 0;

  return Math.min(
    100,
    Math.max(0, Math.round(score <= 1 ? score * 100 : score))
  );
}

function getItemData(item) {
  if (!item || typeof item !== "object") {
    return {};
  }

  return item;
}

function ItemImage({ filename, title }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [filename]);

  if (!filename || failed) {
    return (
      <div className="match-no-image">
        <Package size={30} />
        <span>No Image</span>
      </div>
    );
  }

  const src =
    filename.startsWith("http://") ||
    filename.startsWith("https://")
      ? filename
      : imageUrl(filename);

  return (
    <img
      src={src}
      alt={title || "Item"}
      onError={() => setFailed(true)}
    />
  );
}

function ScoreBar({ icon, label, value }) {
  const percentage = getScore(value);

  return (
    <div className="score-bar">
      <div className="score-bar-top">
        <span>
          {icon}
          {label}
        </span>

        <strong>{percentage}%</strong>
      </div>

      <div className="score-track">
        <div
          className="score-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MatchItemCard({ item, label }) {
  return (
    <div className="match-item">
      <div className="match-item-label">
        {label}
      </div>

      <div className="match-image">
        <ItemImage
          filename={item.image}
          title={item.title}
        />
      </div>

      <div className="match-item-content">
        <span className="match-category">
          {item.category || "Other"}
        </span>

        <h3>
          {item.title || "Item details unavailable"}
        </h3>

        <p>
          {item.description || "No description available."}
        </p>

        <div className="match-meta">
          <div>
            <MapPin size={14} />
            {item.location || "Unknown location"}
          </div>

          <div>
            <CalendarDays size={14} />
            {item.date || "Unknown date"}
          </div>

          <div>
            <Clock3 size={14} />
            {item.time || "Unknown time"}
          </div>
        </div>
      </div>
    </div>
  );
}

function Matches({ onBack }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/matches");

      console.log(
        "AI MATCHES DATA:",
        JSON.stringify(response.data, null, 2)
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setMatches(data);
      } else if (Array.isArray(data?.matches)) {
        setMatches(data.matches);
      } else {
        setMatches([]);
      }
    } catch (err) {
      console.error("AI Matches Error:", err);

      setMatches([]);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load AI matches."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const getStatus = (match) => {
    const score = getScore(match.finalScore);

    if (match.status === "confirmed") return "CONFIRMED";
    if (match.status === "rejected") return "REJECTED";
    if (score >= 70) return "POSSIBLE MATCH";

    return "LOW MATCH";
  };

  return (
    <div className="matches-page-premium">
      <div className="matches-topbar">
        <button
          className="matches-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <div className="matches-system-status">
          <span></span>
          AI MATCHING ENGINE
        </div>
      </div>

      <div className="matches-container">
        <section className="matches-header">
          <div>
            <div className="matches-label">
              <BrainCircuit size={14} />
              INTELLIGENT RECOVERY
            </div>

            <h1>
              AI <span>Match Results</span>
            </h1>

            <p>
              Our AI compares item images, descriptions,
              categories, locations and time to identify
              possible matches between lost and found reports.
            </p>
          </div>

          <div className="matches-count">
            <strong>{matches.length}</strong>

            <span>
              {matches.length === 1 ? "match" : "matches"} detected
            </span>
          </div>
        </section>

        {loading && (
          <div className="matches-loading">
            <div className="matches-loader">
              <BrainCircuit size={25} />
            </div>

            <h3>Loading AI match results</h3>
            <p>Please wait...</p>
          </div>
        )}

        {!loading && error && (
          <div className="matches-empty">
            <div className="matches-empty-icon">
              <BrainCircuit size={28} />
            </div>

            <h3>AI Matches unavailable</h3>

            <p>{error}</p>

            <button onClick={fetchMatches}>
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div className="matches-empty">
            <div className="matches-empty-icon">
              <Sparkles size={27} />
            </div>

            <h3>No AI matches yet</h3>

            <p>
              No AI match records have been generated yet.
              Please run the AI matching process.
            </p>

            <button onClick={fetchMatches}>
              <RefreshCw size={16} />
              Refresh Matches
            </button>
          </div>
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="matches-list">
            {matches.map((match) => {
              const lost = getItemData(match.lostItemId);
              const found = getItemData(match.foundItemId);

              const finalScore = getScore(match.finalScore);
              const status = getStatus(match);

              const itemDetailsMissing =
                !lost._id || !found._id;

              return (
                <article
                  className="match-card"
                  key={match._id}
                >
                  <div className="match-card-header">
                    <div className="match-title">
                      <div className="match-ai-icon">
                        <BrainCircuit size={19} />
                      </div>

                      <div>
                        <span>AI ANALYSIS</span>
                        <h2>Possible Item Match</h2>
                      </div>
                    </div>

                    <div
                      className={`match-status ${status
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      <span></span>
                      {status}
                    </div>
                  </div>

                  {itemDetailsMissing && (
                    <div className="match-data-warning">
                      Item details could not be loaded for this
                      match. Check the Lost and Found item
                      references in the database.
                    </div>
                  )}

                  <div className="match-items">
                    <MatchItemCard
                      item={lost}
                      label="LOST ITEM"
                    />

                    <div className="match-score-center">
                      <div className="score-orbit">
                        <div className="score-circle">
                          <strong>{finalScore}%</strong>
                          <span>MATCH</span>
                        </div>
                      </div>

                      <Sparkles size={15} />

                      <span>AI confidence</span>
                    </div>

                    <MatchItemCard
                      item={found}
                      label="FOUND ITEM"
                    />
                  </div>

                  <div className="match-breakdown">
                    <div className="breakdown-title">
                      <Target size={16} />
                      MATCH SCORE BREAKDOWN
                    </div>

                    <div className="score-grid">
                      <ScoreBar
                        icon={<ImageIcon size={15} />}
                        label="Image"
                        value={match.imageScore}
                      />

                      <ScoreBar
                        icon={<FileText size={15} />}
                        label="Text"
                        value={match.textScore}
                      />

                      <ScoreBar
                        icon={<Layers3 size={15} />}
                        label="Category"
                        value={match.categoryScore}
                      />

                      <ScoreBar
                        icon={<MapPin size={15} />}
                        label="Location"
                        value={match.locationScore}
                      />

                      <ScoreBar
                        icon={<Clock3 size={15} />}
                        label="Time"
                        value={match.timeScore}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Matches;
