import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import './index.css';

function Register() {
    const navigate = useNavigate();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Hasła nie są zgodne!');
            return;
        }

        navigate('/login');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Rejestracja</h2>
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
                <p className="auth-link">
                    Masz już konto?{' '}
                    <Link to="/login" className="auth-link-text">
                        Zaloguj się
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;