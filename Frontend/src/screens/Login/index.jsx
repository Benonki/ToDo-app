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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await loginUser(email, password);

      await apiFetch("/auth/sync-user", {
        method: "POST",
      });

      navigate("/");
    } catch (err) {
      setError(err.message || "Błąd logowania");
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
            />
          </div>

          <button type="submit" className="auth-btn">
            Zaloguj się
          </button>
        </form>

        {error && <p className="auth-error">{error}</p>}

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
