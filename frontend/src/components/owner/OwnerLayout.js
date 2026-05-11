import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";

const links = [
  { to: "/owner-dashboard", icon: "bi-building", label: "My Venues" },
  { to: "/owner-bookings", icon: "bi-calendar-check", label: "Booking Requests" },
  { to: "/owner-details", icon: "bi-person-gear", label: "My Profile" },
];

export default function OwnerLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="d-flex">
        <aside className="sidebar d-none d-md-block">
          <div style={{ padding: "0.5rem 1.25rem 1rem", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-faint)" }}>
            Owner Panel
          </div>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <i className={`bi ${l.icon}`}></i>
              {l.label}
            </NavLink>
          ))}
        </aside>
        <main style={{ flex: 1, minWidth: 0, padding: "1.5rem" }}>
          {/* Mobile nav */}
          <div className="d-flex d-md-none gap-2 mb-4 overflow-auto pb-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `btn-outline-custom d-flex align-items-center gap-1 ${isActive ? "btn-primary-custom" : ""}`
                }
                style={{ whiteSpace: "nowrap", textDecoration: "none" }}
              >
                <i className={`bi ${l.icon}`}></i> {l.label}
              </NavLink>
            ))}
          </div>
          {children}
        </main>
      </div>
    </>
  );
}
