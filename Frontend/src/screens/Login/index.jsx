import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import './index.css';

function Login() {
    const navigate = useNavigate();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Logowanie</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="login">Login</label>
                        <input
                            type="text"
                            id="login"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            placeholder="Wprowadź login"
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
                <p className="auth-link">
                    Nie masz konta?{' '}
                    <Link to="/register" className="auth-link-text">
                        Zarejestruj się
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;