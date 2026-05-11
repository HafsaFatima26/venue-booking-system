import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function LoginPage() {
  const { loginAsCustomer, loginAsOwner } = useApp();
  const navigate = useNavigate();

  const handleCustomer = () => {
    loginAsCustomer();
    navigate("/customer-dashboard");
  };

  const handleOwner = () => {
    loginAsOwner();
    navigate("/owner-dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="brand-logo">Venue<span>Spot</span></div>
        <p className="tagline">Pakistan's premier venue booking platform</p>

        <hr style={{ borderColor: "var(--color-border)", marginBottom: "1.5rem" }} />

        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "1rem", textAlign: "left" }}>
          Continue as:
        </p>

        <button className="role-btn" onClick={handleCustomer}>
          <div className="role-icon"><i className="bi bi-person-fill"></i></div>
          <div>
            <div className="role-label">Customer</div>
            <div className="role-sub">Browse & book venues for your events</div>
          </div>
          <i className="bi bi-chevron-right ms-auto" style={{ color: "var(--color-text-faint)" }}></i>
        </button>

        <button className="role-btn" onClick={handleOwner}>
          <div className="role-icon" style={{ background: "var(--color-accent)" }}>
            <i className="bi bi-building"></i>
          </div>
          <div>
            <div className="role-label">Venue Owner</div>
            <div className="role-sub">Manage your venues & bookings</div>
          </div>
          <i className="bi bi-chevron-right ms-auto" style={{ color: "var(--color-text-faint)" }}></i>
        </button>

        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)", marginTop: "1.5rem" }}>
          Demo mode — no real authentication required
        </p>
      </div>
    </div>
  );
}
