import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Navbar from "../../components/shared/Navbar";

export default function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getVenueById } = useApp();
  const venue = getVenueById(id);
  const [activeImg, setActiveImg] = useState(0);

  if (!venue) {
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center">
          <i className="bi bi-exclamation-triangle" style={{ fontSize: "3rem", color: "var(--color-text-faint)" }}></i>
          <h3 className="mt-3">Venue Not Found</h3>
          <button className="btn-primary-custom mt-3" onClick={() => navigate("/customer-dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </>
    );
  }

  const stars = "★".repeat(Math.floor(venue.rating)) + "☆".repeat(5 - Math.floor(venue.rating));

  return (
    <>
      <Navbar />
      <div className="container-xl py-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb" style={{ fontSize: "var(--text-sm)" }}>
            <li className="breadcrumb-item">
              <button onClick={() => navigate("/customer-dashboard")} style={{ background: "none", border: "none", color: "var(--color-primary)", padding: 0, cursor: "pointer" }}>
                Venues
              </button>
            </li>
            <li className="breadcrumb-item active">{venue.name}</li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* LEFT — Gallery + Info */}
          <div className="col-lg-7">
            {/* Main image */}
            <img
              src={venue.images[activeImg]}
              alt={venue.name}
              className="detail-gallery-main mb-2"
            />
            {/* Thumbnails */}
            {venue.images.length > 1 && (
              <div className="row g-2">
                {venue.images.map((img, i) => (
                  <div key={i} className="col-3">
                    <img
                      src={img}
                      alt={`${venue.name} ${i + 1}`}
                      className={`detail-gallery-thumb ${i === activeImg ? "active" : ""}`}
                      onClick={() => setActiveImg(i)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Details */}
          <div className="col-lg-5">
            <div className="section-card h-100">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>{venue.name}</h1>
                <span className="badge-status badge-confirmed">{venue.type}</span>
              </div>

              <div className="d-flex align-items-center gap-3 mb-3" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                <span><i className="bi bi-geo-alt-fill" style={{ color: "var(--color-accent)" }}></i> {venue.location}</span>
                <span><i className="bi bi-people-fill"></i> Up to {venue.capacity} guests</span>
              </div>

              <div className="mb-3">
                <span className="stars">{stars}</span>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginLeft: "0.5rem" }}>
                  {venue.rating} out of 5 · {venue.reviews} reviews
                </span>
              </div>

              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
                {venue.description}
              </p>

              <div className="mb-4">
                <h6 style={{ fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: "0.5rem" }}>Amenities</h6>
                <div className="d-flex flex-wrap gap-2">
                  {venue.amenities.map((a) => (
                    <span key={a} className="amenity-tag">
                      <i className="bi bi-check-circle-fill"></i> {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between p-3 rounded mb-4"
                style={{ background: "var(--color-primary-light)", border: "1px solid var(--color-border)" }}>
                <div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>Price per event</div>
                  <div style={{ fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-primary)" }}>
                    PKR {venue.price.toLocaleString()}
                  </div>
                </div>
                <i className="bi bi-currency-exchange" style={{ fontSize: "2rem", color: "var(--color-primary)", opacity: 0.4 }}></i>
              </div>

              <button
                className="btn-primary-custom w-100"
                style={{ padding: "0.75rem", fontSize: "var(--text-base)" }}
                onClick={() => navigate("/booking", { state: { venueId: venue.id } })}
              >
                <i className="bi bi-calendar-plus me-2"></i>Book This Venue
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
