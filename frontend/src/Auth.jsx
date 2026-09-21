import { useState } from "react";
import {
  ScanFace,
  LogIn,
  UserPlus,
  Sparkles
} from "lucide-react";
import "./Auth.css";

const API_URL = "http://127.0.0.1:3000";

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (mode === "register" && !form.name.trim()) {
      setMessage("Name দিন।");
      return;
    }

    if (!form.email.trim()) {
      setMessage("Email দিন।");
      return;
    }

    if (!form.password) {
      setMessage("Password দিন।");
      return;
    }

    try {
      setLoading(true);

      const endpoint =
        mode === "login"
          ? "/api/auth/login"
          : "/api/auth/register";

      const body =
        mode === "login"
          ? {
              email: form.email.trim(),
              password: form.password
            }
          : {
              name: form.name.trim(),
              email: form.email.trim(),
              password: form.password
            };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Authentication failed"
        );
      }

      if (mode === "register") {
        setMessage(
          "Registration successful. এখন Login করুন।"
        );

        setMode("login");

        setForm({
          name: "",
          email: form.email,
          password: ""
        });

        return;
      }

      localStorage.setItem(
        "motomedia_token",
        data.token
      );

      localStorage.setItem(
        "motomedia_user",
        JSON.stringify(data.user)
      );

      onLogin(data.user, data.token);
    } catch (error) {
      console.error("AUTH ERROR:", error);

      setMessage(
        error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMessage("");

    setMode((previous) =>
      previous === "login"
        ? "register"
        : "login"
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-one"></div>
      <div className="auth-orb auth-orb-two"></div>
      <div className="auth-orb auth-orb-three"></div>

      <div className="auth-particles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="auth-card">
        <div className="auth-top-line"></div>

        <div className="auth-logo">
          <div className="auth-logo-icon">
            <ScanFace
              size={32}
              strokeWidth={2.2}
            />
          </div>

          <div>
            <h1>Ayna</h1>
            <p>Connect • Share • Discover</p>
          </div>
        </div>

        <div className="auth-welcome-icon">
          <Sparkles size={18} />
        </div>

        <div className="auth-title">
          <h2>
            {mode === "login"
              ? "Welcome Back"
              : "Create Your Account"}
          </h2>

          <span>
            {mode === "login"
              ? "Login to continue to Ayna"
              : "Join Ayna and connect with people"}
          </span>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          {mode === "register" && (
            <div className="auth-input-group">
              <label>Full Name</label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-input-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="auth-input-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
            />
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-loading">
                <span></span>
                <span></span>
                <span></span>
                Please wait...
              </span>
            ) : (
              <>
                {mode === "login" ? (
                  <LogIn size={19} />
                ) : (
                  <UserPlus size={19} />
                )}

                {mode === "login"
                  ? "Login to Ayna"
                  : "Create Account"}
              </>
            )}
          </button>
        </form>

        {message && (
          <div
            className={`auth-message ${
              message.includes("successful")
                ? "success"
                : "error"
            }`}
          >
            {message}
          </div>
        )}

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="auth-switch">
          <span>
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>

          <button
            type="button"
            onClick={toggleMode}
          >
            {mode === "login"
              ? "Create account"
              : "Login"}
          </button>
        </div>

        <div className="auth-footer">
          <span>© 2026</span>
          <strong>Ayna</strong>
          <span>Social Platform</span>
        </div>
      </div>
    </div>
  );
}

export default Auth;