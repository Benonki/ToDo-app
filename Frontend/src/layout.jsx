import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import "./layout.css";
import Cookies from "js-cookie";

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => {
        return location.pathname === path ? "active" : "";
    };

    const handleLogout = () => {
        Cookies.remove('authToken');
        navigate('/login');
    };

    return (
        <div className="layout">
            <nav className="navbar">
                <ul className="nav-menu">
                    <li className="nav-item">
                        <Link to="/" className={`nav-link ${isActive("/")}`}>
                            <span className="nav-text">Strona główna</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/profile" className={`nav-link ${isActive("/profile")}`}>
                            <span className="nav-text">Profil</span>
                        </Link>
                    </li>
                </ul>
                <button className="logout-button" onClick={handleLogout}>
                    <span className="logout-text">Wyloguj</span>
                    <FiLogOut className="logout-icon" />
                </button>
            </nav>
            <main className="main-content">
                <div className="content-wrapper">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;