import React from "react";
import { useNavigate } from "react-router-dom";

export default function VenueCard({ venue }) {
  const navigate = useNavigate();

  const stars =
    "★".repeat(Math.floor(venue.rating)) +
    "☆".repeat(5 - Math.floor(venue.rating));

  return (
    <div className="venue-card-horizontal">
      {/* Left — Image */}
      <div className="venue-card-horizontal-img-wrap">
        <img
          src={venue.images[0]}
          alt={venue.name}
          className="venue-card-horizontal-img"
          loading="lazy"
        />
      </div>

      {/* Right — Details */}
      <div className="venue-card-horizontal-body">
        <div className="venue-card-horizontal-header">
          <h3 className="venue-card-title">{venue.name}</h3>
          <div className="venue-card-price">PKR {venue.price.toLocaleString()}</div>
        </div>

        <div className="venue-card-meta d-flex align-items-center gap-2 mb-2">
          <span>
            <i className="bi bi-geo-alt-fill" style={{ color: "var(--color-accent)" }}></i>{" "}
            {venue.location}
          </span>
          <span>·</span>
          <span>
            <i className="bi bi-people-fill"></i> {venue.capacity} guests
          </span>
          <span>·</span>
          <span className="stars">{stars}</span>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            {venue.rating} ({venue.reviews})
          </span>
        </div>

        <p className="venue-card-horizontal-desc">{venue.description}</p>

        {/* Amenities */}
        <div className="venue-card-horizontal-amenities">
          {venue.amenities.slice(0, 4).map((a) => (
            <span key={a} className="amenity-tag">
              <i className="bi bi-check-circle-fill"></i> {a}
            </span>
          ))}
          {venue.amenities.length > 4 && (
            <span className="amenity-tag" style={{ opacity: 0.7 }}>
              +{venue.amenities.length - 4} more
            </span>
          )}
        </div>

        {/* View Details button — bottom right */}
        <div className="venue-card-horizontal-footer">
          <button
            className="btn-primary-custom"
            onClick={() => navigate(`/venue/${venue.id}`)}
          >
            View Details <i className="bi bi-arrow-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
