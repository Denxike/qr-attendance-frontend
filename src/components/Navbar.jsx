import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <div className="logo">QR</div>
                <span>Attendance System</span>
            </div>

            <div className="navbar-user">
                <div className="user-info">
                    <div className="user-name">{user?.fullName}</div>
                    <div className="user-role">{user?.role}</div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;