import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import ReportItem from "./ReportItem";
import Login from "./Login";
import SearchItems from "./SearchItems";
import Matches from "./Matches";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

function ReportPage({ type }) {
  const navigate = useNavigate();
  return <ReportItem type={type} onBack={() => navigate("/")} />;
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Go back to the page the user originally wanted
  const goAfterLogin = location.state?.from?.pathname || "/";

  return (
    <Login
      onLogin={() => {
        // Login.jsx already saves the token; sync it into the auth context
        const token = localStorage.getItem("token");
        if (token) login(token);
        navigate(goAfterLogin, { replace: true });
      }}
      onBack={() => navigate("/")}
    />
  );
}

function Home() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <Navbar />

      <main className="hero">
        <h2>Lost Something? Find It Faster.</h2>

        <p>
          Report lost and found items on campus and use
          AI-powered matching to find possible matches.
        </p>

        <div className="actions">
          <button className="primary-btn" onClick={() => navigate("/report-lost")}>
            Report Lost Item
          </button>
          <button className="secondary-btn" onClick={() => navigate("/report-found")}>
            Report Found Item
          </button>
          <button className="secondary-btn" onClick={() => navigate("/search")}>
            Search Items
          </button>
          <button className="secondary-btn" onClick={() => navigate("/matches")}>
            View AI Matches
          </button>
        </div>
      </main>

      <section className="features">
        <div className="feature-card">
          <h3>&#128241; Report Items</h3>
          <p>
            Upload an image and provide details about
            the lost or found item.
          </p>
        </div>

        <div className="feature-card">
          <h3>&#129302; AI Matching</h3>
          <p>
            YOLO and CLIP help compare item images and
            descriptions to find possible matches.
          </p>
        </div>

        <div className="feature-card">
          <h3>&#128269; Search Items</h3>
          <p>
            Search lost and found items by category,
            location and other details.
          </p>
        </div>
      </section>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/report-lost"
        element={
          <ProtectedRoute>
            <ReportPage type="lost" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/report-found"
        element={
          <ProtectedRoute>
            <ReportPage type="found" />
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/search"
        element={
          <>
            <Navbar />
            <SearchItems />
          </>
        }
      />

      <Route
        path="/matches"
        element={
          <ProtectedRoute>
            <Navbar />
            <Matches />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;