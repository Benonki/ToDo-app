import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser, registerUser } from "../../firebase/auth";
import { apiFetch } from "../../services/api";
import "./index.css";

function Register() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Hasła nie są zgodne");
      return;
    }

    try {
      await registerUser(email, password, displayName);

      await apiFetch("/auth/sync-user", {
        method: "POST",
      });

      await logoutUser();

      navigate("/login");
    } catch (err) {
      setError(err.message || "Błąd rejestracji");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Rejestracja</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Nazwa użytkownika</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Wprowadź nazwę"
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">Potwierdź hasło</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Potwierdź hasło"
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            Zarejestruj się
          </button>
        </form>

        {error && <div className="auth-error">{error}</div>}

        <p className="auth-link">
          Masz już konto?{" "}
          <Link to="/login" className="auth-link-text">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
