import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Navbar from "../../components/shared/Navbar";
import VenueFormModal from "../../components/owner/VenueFormModal";
import Toast from "../../components/shared/Toast";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { getVenuesForOwner, addVenue, updateVenue, deleteVenue } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editVenue, setEditVenue] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const venues = getVenuesForOwner();

  const handleSave = (data) => {
    if (editVenue) {
      updateVenue(editVenue.id, data);
      setToast({ message: "Venue updated successfully!", type: "success" });
    } else {
      addVenue(data);
      setToast({ message: "Venue added successfully!", type: "success" });
    }
    setEditVenue(null);
  };

  const handleEdit = (venue) => {
    setEditVenue(venue);
    setShowModal(true);
  };

  const handleDeleteConfirm = (id) => {
    deleteVenue(id);
    setConfirmDelete(null);
    setToast({ message: "Venue deleted.", type: "danger" });
  };

  const stars = (rating) =>
    "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));

  return (
    <>
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <VenueFormModal
        show={showModal}
        onClose={() => { setShowModal(false); setEditVenue(null); }}
        onSave={handleSave}
        editVenue={editVenue}
      />

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: "2rem", maxWidth: "380px", width: "100%", textAlign: "center", boxShadow: "var(--shadow-lg)" }}>
            <i className="bi bi-trash3" style={{ fontSize: "2.5rem", color: "#dc2626" }}></i>
            <h5 style={{ marginTop: "0.75rem", fontWeight: 700 }}>Delete Venue?</h5>
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", marginBottom: "1.5rem" }}>
              This action cannot be undone. All associated bookings will remain in the system.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn-outline-custom" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn-danger-custom" onClick={() => handleDeleteConfirm(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="container-xl py-4">
        {/* Top Action Bar */}
        <div className="page-header d-flex justify-content-between align-items-center">
          <button
            className="btn-primary-custom"
            onClick={() => { setEditVenue(null); setShowModal(true); }}
          >
            <i className="bi bi-plus-circle me-1"></i>Add Venue
          </button>
          <div className="d-flex gap-2">
            <button
              className="btn-outline-custom"
              onClick={() => navigate("/owner-bookings")}
            >
              <i className="bi bi-calendar-check me-1"></i>My Bookings
            </button>
            <button
              className="btn-outline-custom"
              onClick={() => navigate("/owner-details")}
            >
              <i className="bi bi-person-gear me-1"></i>Owner Details
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Venues", value: venues.length, icon: "bi-building", color: "var(--color-primary)" },
            { label: "Total Capacity", value: venues.reduce((s, v) => s + v.capacity, 0).toLocaleString(), icon: "bi-people-fill", color: "#f97316" },
            { label: "Avg. Rating", value: venues.length ? (venues.reduce((s, v) => s + (v.rating || 0), 0) / venues.length).toFixed(1) : "—", icon: "bi-star-fill", color: "#f59e0b" },
          ].map((stat) => (
            <div key={stat.label} className="col-4">
              <div className="section-card text-center">
                <i className={`bi ${stat.icon}`} style={{ fontSize: "1.5rem", color: stat.color }}></i>
                <div style={{ fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-text)", margin: "0.25rem 0" }}>{stat.value}</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Venue List — same horizontal card style as customer dashboard */}
        {venues.length === 0 ? (
          <div className="empty-state section-card">
            <i className="bi bi-building-add"></i>
            <h5>No venues yet</h5>
            <p>Add your first venue to start receiving bookings from customers.</p>
            <button className="btn-primary-custom" onClick={() => { setEditVenue(null); setShowModal(true); }}>
              <i className="bi bi-plus-circle me-1"></i>Add First Venue
            </button>
          </div>
        ) : (
          <div className="venue-list-stack">
            {venues.map((venue) => (
              <div key={venue.id} className="venue-card-horizontal">
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
                    <span className="stars">{stars(venue.rating)}</span>
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

                  {/* Edit / Delete buttons — bottom right */}
                  <div className="venue-card-horizontal-footer">
                    <div className="d-flex gap-2">
                      <button className="btn-outline-custom" onClick={() => handleEdit(venue)}>
                        <i className="bi bi-pencil me-1"></i>Edit
                      </button>
                      <button className="btn-danger-custom" onClick={() => setConfirmDelete(venue.id)}>
                        <i className="bi bi-trash me-1"></i>Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
