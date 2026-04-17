import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../firebase/auth";
import { apiFetch } from "../../services/api";
import "./index.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await loginUser(email, password);

      await apiFetch("/auth/sync-user", {
        method: "POST",
      });

      navigate("/");
    } catch (err) {
      setError(err.message || "Błąd logowania");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Logowanie</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Wprowadź email"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wprowadź hasło"
              required
              disabled={isLoading}
            />
          </div>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? (
                  <div className="spinner"></div>
              ) : (
                  "Zaloguj się"
              )}
          </button>
        </form>

        {error && <div className="auth-error">{error}</div>}

        <p className="auth-link">
          Nie masz konta?{" "}
          <Link to="/register" className="auth-link-text">
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;