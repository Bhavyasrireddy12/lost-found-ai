import { useState } from "react";
import api from "./api/axios";
import { useAuth } from "./context/AuthContext";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  MoreHorizontal,
  ShieldCheck,
} from "lucide-react";

function Login({ onLogin, onBack }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        email: email.trim(),
        password,
      });

      console.log("LOGIN RESPONSE:", response.data);

      const { token, user } = response.data;

      if (!token) {
        throw new Error(
          "Login succeeded but no token was received from the server."
        );
      }

      login(token, user || null);

      const savedToken = localStorage.getItem("token");

      console.log(
        "TOKEN SAVED:",
        savedToken ? "YES" : "NO"
      );

      if (!savedToken) {
        throw new Error(
          "Token could not be saved in localStorage."
        );
      }

      alert("Login successful!");

      onLogin();
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Login failed";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      alert("Please enter your email address first.");
      return;
    }

    alert(
      `Password reset option will be available for ${email.trim()}`
    );
  };

  const handleGoogleLogin = () => {
    alert("Google login will be connected soon.");
  };

  const handleLinkedInLogin = () => {
    alert("LinkedIn login will be connected soon.");
  };

  const handleMoreLogin = () => {
    alert("More login options will be available soon.");
  };

  return (
    <div className="login-page">

      {/* Back Button */}
      <button
        className="login-back-button"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Login Card */}
      <div className="login-card">

        {/* Header */}
        <div className="login-header">

          <div className="login-logo">
            <ShieldCheck size={30} />
          </div>

          <h1>Welcome Back</h1>

          <p>
            Login to your Lost &amp; Found account
          </p>

        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="login-error">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          {/* Email */}
          <div className="login-field">

            <label htmlFor="login-email">
              Email Address
            </label>

            <div className="login-input-wrapper">

              <Mail
                size={20}
                className="login-input-icon"
              />

              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                disabled={loading}
              />

            </div>

          </div>

          {/* Password */}
          <div className="login-field">

            <div className="password-label-row">

              <label htmlFor="login-password">
                Password
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>

            </div>

            <div className="login-input-wrapper">

              <Lock
                size={20}
                className="login-input-icon"
              />

              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>

            </div>

          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="login-main-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>or continue with</span>
        </div>

        {/* Social Login Options */}
        <div className="social-login-options">

          {/* Google */}
          <button
            type="button"
            className="social-login-button"
            onClick={handleGoogleLogin}
          >
            <span className="social-letter google-letter">
              G
            </span>

            <span>Google</span>
          </button>

          {/* LinkedIn */}
          <button
            type="button"
            className="social-login-button"
            onClick={handleLinkedInLogin}
          >
            <span className="social-letter linkedin-letter">
              in
            </span>

            <span>LinkedIn</span>
          </button>

          {/* More */}
          <button
            type="button"
            className="social-login-button social-more-button"
            onClick={handleMoreLogin}
          >
            <MoreHorizontal size={22} />

            <span>More</span>
          </button>

        </div>

        {/* Sign Up */}
        <div className="signup-section">

          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={() =>
              alert("Sign Up page will open here.")
            }
          >
            Sign Up
          </button>

        </div>

        {/* Security Footer */}
        <p className="login-security">
          🔒 Your account information is secure
        </p>

      </div>
    </div>
  );
}

export default Login;