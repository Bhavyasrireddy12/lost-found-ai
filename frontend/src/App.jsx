
import { useEffect, useState } from "react";
import {
  Search,
  PackageSearch,
  PackageCheck,
  BrainCircuit,
  LogIn,
  LogOut,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Database,
  ScanSearch,
  ChevronRight,
  Sun,
  Moon,
  X,
  Scan,
  Images,
  ChartNoAxesCombined,
} from "lucide-react";
import "./App.css";
import ReportItem from "./ReportItem";
import Login from "./Login";
import SearchItems from "./SearchItems";
import Matches from "./Matches";

const aiTechnologyDetails = {
  yolo: {
    title: "YOLO",
    subtitle: "Object Detection",
    icon: Scan,
    description:
      "YOLO (You Only Look Once) is an object detection model used to identify and locate objects in images. In a campus recovery system, it can help process photographs of lost and found belongings.",
    points: [
      "Processes uploaded item photographs.",
      "Can detect objects such as bags, bottles, books and phones when supported by the model.",
      "Helps identify the region containing an object.",
      "The detected object or processed image can be passed to later matching stages.",
    ],
    flow: "Uploaded Image → Image Preprocessing → YOLO Detection",
  },
  clip: {
    title: "CLIP",
    subtitle: "Image Similarity",
    icon: Images,
    description:
      "CLIP creates image and text embeddings that can be compared to estimate how closely an image and a description relate. This helps the system compare reported belongings.",
    points: [
      "Converts an image into a numerical representation called an embedding.",
      "Can represent text descriptions in the same embedding space.",
      "Helps compare images or image and text descriptions.",
      "Similarity is a signal for matching, not proof that two reports refer to the same object.",
    ],
    flow: "Image / Text → CLIP Embeddings → Similarity Comparison",
  },
  scoring: {
    title: "AI Match Scoring",
    subtitle: "Potential Match Identification",
    icon: ChartNoAxesCombined,
    description:
      "The matching pipeline combines visual similarity and report details to rank potentially related lost and found records. A higher score suggests a stronger candidate for review.",
    points: [
      "Image similarity compares visual appearance.",
      "Text similarity compares the descriptions.",
      "Category and location provide additional context.",
      "Time information can help rank potential matches.",
      "A score is an estimate and does not guarantee that an item has been identified correctly.",
    ],
    flow: "Image + Text + Category + Location + Time → Final Match Score",
  },
  fusion: {
    title: "Enhancements",
    subtitle: "AI-powered matching enhancements",
    icon: ChartNoAxesCombined,
    description:
      "FusionMatch AI is a multi-factor matching system for the campus Lost & Found app. It compares lost and found reports using image appearance, text descriptions, category, location, and time, then presents a score to help users review possible matches.",
    features: [
      {
        title: "Image Similarity",
        description:
          "Compares the visual appearance of lost-item and found-item photos.",
        icon: Images,
      },
      {
        title: "Text Similarity",
        description:
          "Compares item names and descriptions to find related reports.",
        icon: Search,
      },
      {
        title: "Location & Time Matching",
        description:
          "Checks where and when the items were reported for useful matching clues.",
        icon: ScanSearch,
      },
      {
        title: "Final Match Score",
        description:
          "Combines available matching signals to rank potential matches for review.",
        icon: ChartNoAxesCombined,
      },
    ],
    flow:
      "Image Similarity + Text Similarity + Category + Location + Time → Final Match Score",
  },
};

function App() {
  const [page, setPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );
  const [activeAiInfo, setActiveAiInfo] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const syncLoginState = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", syncLoginState);
    window.addEventListener("auth:logout", syncLoginState);

    return () => {
      window.removeEventListener("storage", syncLoginState);
      window.removeEventListener("auth:logout", syncLoginState);
    };
  }, []);

  useEffect(() => {
    if (!activeAiInfo) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveAiInfo(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeAiInfo]);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "dark" ? "light" : "dark"
    );
  };

  const handleLogin = () => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    setPage("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setPage("home");
  };

  const openAiInfo = (key) => {
    setActiveAiInfo(aiTechnologyDetails[key] || null);
  };

  const renderAiCard = (key, label, subtitle) => {
    const technology = aiTechnologyDetails[key];
    const Icon = technology.icon;

    return (
      <button
        type="button"
        className="ai-tech-card"
        key={key}
        onClick={() => openAiInfo(key)}
        aria-haspopup="dialog"
        aria-label={`Learn more about ${label}: ${subtitle}`}
      >
        <span className="ai-tech-icon">
          <Icon size={23} />
        </span>
        <strong>{label}</strong>
        <span>{subtitle}</span>
        <small>Click to learn more ↗</small>
      </button>
    );
  };

  // FULL-PAGE ENHANCEMENTS
  if (page === "enhancements") {
    const enhancement = aiTechnologyDetails.fusion;

    return (
      <div className="enhancements-page">
        <header className="enhancements-topbar">
          <button
            type="button"
            className="enhancements-back"
            onClick={() => setPage("home")}
          >
            <ArrowRight
              size={18}
              className="enhancements-back-arrow"
            />
            Back to Home
          </button>

          <span className="enhancements-brand">
            <Sparkles size={18} />
            Campus AI Technology
          </span>
        </header>

        <main className="enhancements-content">
          <section className="enhancements-hero">
            <span className="enhancements-eyebrow">
              <Sparkles size={15} />
              SMART CAMPUS RECOVERY
            </span>

            <h1>Enhancements</h1>
            <p>{enhancement.description}</p>

            <div className="enhancements-flow">
              <span>Image</span>
              <ChevronRight size={17} />
              <span>Text</span>
              <ChevronRight size={17} />
              <span>Location &amp; Time</span>
              <ChevronRight size={17} />
              <strong>Match Score</strong>
            </div>
          </section>

          <section className="enhancements-section">
            <div className="enhancements-section-heading">
              <div>
                <span className="enhancements-eyebrow">
                  FOUR MATCHING FEATURES
                </span>
                <h2>How Enhancements Work</h2>
              </div>

              <p>
                Each signal adds useful context to help rank possible
                lost-and-found matches.
              </p>
            </div>

            <div className="enhancements-feature-grid">
              {enhancement.features.map((feature, index) => {
                const FeatureIcon = feature.icon;

                return (
                  <article
                    className="enhancements-feature-card"
                    key={feature.title}
                  >
                    <div className="enhancements-feature-top">
                      <span className="enhancements-feature-icon">
                        <FeatureIcon size={25} />
                      </span>
                      <span className="enhancements-feature-number">
                        0{index + 1}
                      </span>
                    </div>

                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>

                    <div className="enhancements-feature-footer">
                      <span className="enhancements-status-dot" />
                      Matching signal
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="enhancements-how">
            <div className="enhancements-how-icon">
              <ChartNoAxesCombined size={25} />
            </div>

            <div className="enhancements-how-content">
              <span className="enhancements-eyebrow">
                MATCHING PIPELINE
              </span>
              <h2>From reports to possible matches</h2>
              <p>{enhancement.flow}</p>
              <small>
                Match scores are estimates to help users review
                suggestions; they do not guarantee an exact
                identification.
              </small>
            </div>

            <button
              type="button"
              className="enhancements-cta"
              onClick={() => setPage("matches")}
            >
              View AI Matches
              <ArrowRight size={17} />
            </button>
          </section>
        </main>
      </div>
    );
  }

  if (page === "lost") {
    return (
      <ReportItem
        type="lost"
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "found") {
    return (
      <ReportItem
        type="found"
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "search") {
    return <SearchItems onBack={() => setPage("home")} />;
  }

  if (page === "matches") {
    return <Matches onBack={() => setPage("home")} />;
  }

  return (
    <div className="premium-app">
      {/* NAVBAR */}
      <header className="premium-navbar">
        <div className="navbar-inner">
          <button
            className="brand"
            type="button"
            onClick={() => setPage("home")}
          >
            <span className="brand-mark">
              <Sparkles size={17} />
            </span>

            <span>
              Lost &amp; Found
              <small>Campus AI</small>
            </span>
          </button>

          <nav className="desktop-nav">
            <button
              type="button"
              className={
                page === "home" ? "nav-link active" : "nav-link"
              }
              onClick={() => setPage("home")}
            >
              Home
            </button>

            <button
              type="button"
              className="nav-link"
              onClick={() => setPage("lost")}
            >
              Report Lost
            </button>

            <button
              type="button"
              className="nav-link"
              onClick={() => setPage("found")}
            >
              Report Found
            </button>

            <button
              type="button"
              className="nav-link"
              onClick={() => setPage("search")}
            >
              Search Items
            </button>

            <button
              type="button"
              className={
                page === "matches" ? "nav-link active" : "nav-link"
              }
              onClick={() => setPage("matches")}
            >
              AI Matches
            </button>

            <button
              type="button"
              className="nav-link"
              onClick={() => setPage("enhancements")}
            >
              Enhancements
            </button>
          </nav>

          <div className="navbar-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
              }
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            {!isLoggedIn ? (
              <button
                type="button"
                className="login-button"
                onClick={() => setPage("login")}
              >
                <LogIn size={16} />
                Login
              </button>
            ) : (
              <>
                <div className="user-profile">
                  <span className="user-avatar">
                    <User size={16} />
                  </span>
                  <span className="user-text">Campus User</span>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  title="Logout"
                  aria-label="Logout"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="status-pill">
                <span className="status-dot" />
                AI CAMPUS RECOVERY SYSTEM
              </div>

              <h1>
                Lost something?
                <br />
                <span>Find it faster.</span>
              </h1>

              <p className="hero-description">
                Report lost and found items across campus and let AI
                identify possible matches using visual intelligence,
                descriptions, category, location and time.
              </p>

              <div className="hero-buttons">
                <button
                  type="button"
                  className="primary-action"
                  onClick={() => setPage("lost")}
                >
                  <PackageSearch size={19} />
                  <span>Report Lost Item</span>
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => setPage("found")}
                >
                  <PackageCheck size={19} />
                  <span>Report Found Item</span>
                </button>
              </div>

              <div className="quick-actions">
                <button
                  type="button"
                  onClick={() => setPage("search")}
                >
                  <Search size={16} />
                  Search Items
                </button>

                <span>/</span>

                <button
                  type="button"
                  onClick={() => setPage("matches")}
                >
                  <BrainCircuit size={16} />
                  View AI Matches
                </button>
              </div>

              <div className="security-line">
                <ShieldCheck size={16} />
                <span>Secure campus reporting</span>
                <span className="separator">•</span>
                <span>AI-assisted matching</span>
              </div>
            </div>

            <div className="hero-panel">
              <div className="panel-header">
                <div>
                  <span className="panel-label">LIVE SYSTEM</span>
                  <h3>Campus AI Engine</h3>
                </div>

                <span className="live-badge">
                  <span />
                  ACTIVE
                </span>
              </div>

              <div className="ai-visual">
                <div className="scan-ring ring-one" />
                <div className="scan-ring ring-two" />
                <div className="scan-ring ring-three" />

                <div className="ai-core">
                  <BrainCircuit size={36} />
                </div>
              </div>

              <div className="engine-status">
                <div className="status-row">
                  <span>
                    <ScanSearch size={15} />
                    Visual analysis
                  </span>
                  <strong>READY</strong>
                </div>

                <div className="status-row">
                  <span>
                    <Database size={15} />
                    Campus database
                  </span>
                  <strong>CONNECTED</strong>
                </div>

                <div className="status-row">
                  <span>
                    <Sparkles size={15} />
                    AI matching
                  </span>
                  <strong>ACTIVE</strong>
                </div>
              </div>

              <button
                type="button"
                className="panel-button"
                onClick={() => setPage("matches")}
              >
                Explore AI Matches
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* HOME PAGE: THREE FEATURE CARDS */}
        <section className="feature-section">
          <div className="section-heading">
            <div>
              <span>HOW IT WORKS</span>
              <h2>A smarter way to recover your belongings.</h2>
            </div>

            <p>
              One campus platform connecting reports, searchable
              records and AI-powered matching.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <PackageSearch size={22} />
              </div>
              <span className="feature-number">01</span>
              <h3>Report</h3>
              <p>
                Upload an image and provide the important details
                about your lost or found item.
              </p>
              <button
                type="button"
                onClick={() => setPage("lost")}
              >
                Start report <ArrowRight size={15} />
              </button>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Search size={22} />
              </div>
              <span className="feature-number">02</span>
              <h3>Search</h3>
              <p>
                Browse campus records using keywords, categories
                and item type filters.
              </p>
              <button
                type="button"
                onClick={() => setPage("search")}
              >
                Search database <ArrowRight size={15} />
              </button>
            </div>

            <div className="feature-card">
              <div className="feature-icon olive">
                <BrainCircuit size={22} />
              </div>
              <span className="feature-number">03</span>
              <h3>Match with AI</h3>
              <p>
                YOLO and CLIP compare visual and contextual
                information to identify possible matches.
              </p>
              <button
                type="button"
                onClick={() => setPage("matches")}
              >
                View matches <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* CAMPUS RECOVERY NETWORK: THREE TECHNOLOGY CARDS */}
        <section className="trust-section">
          <div className="trust-content">
            <span className="trust-label">
              CAMPUS RECOVERY NETWORK
            </span>

            <h2>
              Built for faster,
              <br />
              smarter recovery.
            </h2>

            <p>
              A unified platform for students to report, discover
              and recover lost belongings with intelligent assistance.
            </p>
          </div>

          <div className="trust-stats">
            {renderAiCard("yolo", "YOLO", "Object detection")}
            {renderAiCard("clip", "CLIP", "Image similarity")}
            {renderAiCard("scoring", "AI", "Match scoring")}
          </div>
        </section>
      </main>

      {/* YOLO, CLIP AND SCORING INFORMATION POPUPS */}
      {activeAiInfo && (
        <div
          className="ai-info-overlay"
          onClick={() => setActiveAiInfo(null)}
          role="presentation"
        >
          <div
            className="ai-info-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-info-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="ai-info-close"
              onClick={() => setActiveAiInfo(null)}
              aria-label="Close details"
            >
              <X size={22} />
            </button>

            <span className="ai-info-label">
              CAMPUS AI TECHNOLOGY
            </span>

            <h2 id="ai-info-title">{activeAiInfo.title}</h2>
            <h3>{activeAiInfo.subtitle}</h3>
            <p>{activeAiInfo.description}</p>

            {activeAiInfo.features ? (
              <div className="fusion-feature-grid">
                {activeAiInfo.features.map((feature) => {
                  const FeatureIcon = feature.icon;

                  return (
                    <div
                      className="fusion-feature-card"
                      key={feature.title}
                    >
                      <div className="fusion-feature-icon">
                        <FeatureIcon size={22} />
                      </div>
                      <h4>{feature.title}</h4>
                      <p>{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <h4>How it helps our project</h4>
                <ul>
                  {activeAiInfo.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </>
            )}

            <div className="ai-info-flow">
              <strong>HOW IT WORKS</strong>
              <p>{activeAiInfo.flow}</p>
            </div>

            <button
              type="button"
              className="ai-info-done"
              onClick={() => setActiveAiInfo(null)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="premium-footer">
        <div>
          <strong>Lost &amp; Found Campus AI</strong>
          <span>Intelligent campus recovery platform</span>
        </div>
        <span>© 2026 Campus AI</span>
      </footer>
    </div>
  );
}

export default App;
