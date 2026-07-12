import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo gradient-text">AutoElite</span>
          <span className="navbar-tagline">Premium Automobiles</span>
        </Link>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <div className="navbar-nav">
                <Link
                  to="/dashboard"
                  className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`navbar-link ${isActive('/admin') ? 'active' : ''}`}
                  >
                    Admin Panel
                  </Link>
                )}
              </div>

              <div className="navbar-user">
                <div className="navbar-avatar">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="navbar-username">{user?.username}</span>
                  {isAdmin && <span className="navbar-role">Admin</span>}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={logout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-nav">
              <Link
                to="/login"
                className={`navbar-link ${isActive('/login') ? 'active' : ''}`}
              >
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
