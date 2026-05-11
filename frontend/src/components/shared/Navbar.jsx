import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

export default function Navbar() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (!currentUser) return "/login";
    return currentUser.role === "owner" ? "/owner-dashboard" : "/customer-dashboard";
  };

  return (
    <nav className="app-navbar px-3 py-2">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <Link to={getDashboardLink()} className="brand">
          Venue<span>Spot</span>
        </Link>
        {currentUser && (
          <div className="d-flex align-items-center gap-3">
            <span className="d-none d-sm-inline" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              <i className="bi bi-person-circle me-1"></i>
              {currentUser.full_name || currentUser.username || currentUser.name}
              <span className="ms-2 badge-status badge-pending" style={{ verticalAlign: "middle" }}>
                {currentUser.role}
              </span>
            </span>
            {currentUser.role === "customer" && (
              <Link to="/my-bookings" className="btn-outline-custom d-none d-md-inline-flex align-items-center" style={{ gap: "0.3rem" }}>
                <i className="bi bi-calendar-check"></i> My Bookings
              </Link>
            )}
            <button onClick={handleLogout} className="btn-danger-custom">
              <i className="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
