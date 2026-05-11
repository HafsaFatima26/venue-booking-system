import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Navbar from "../../components/shared/Navbar";
import Toast from "../../components/shared/Toast";

export default function OwnerBookings() {
  const navigate = useNavigate();
  const { getBookingsForOwner, acceptBooking, rejectBooking, getVenueById } = useApp();
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("all");
  const [actionId, setActionId] = useState(null);

  const allBookings = getBookingsForOwner();

  const filtered = allBookings.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  const counts = {
    all: allBookings.length,
    pending: allBookings.filter((b) => b.status === "pending").length,
    confirmed: allBookings.filter((b) => b.status === "confirmed").length,
    rejected: allBookings.filter((b) => b.status === "rejected").length,
  };

  const handleAccept = async (id) => {
    setActionId(id);
    const result = await acceptBooking(id);
    if (result.success) {
      setToast({ message: "Booking confirmed!", type: "success" });
    } else {
      setToast({ message: result.message || "Failed to confirm booking.", type: "danger" });
    }
    setActionId(null);
  };

  const handleReject = async (id) => {
    setActionId(id);
    const result = await rejectBooking(id);
    if (result.success) {
      setToast({ message: "Booking rejected.", type: "danger" });
    } else {
      setToast({ message: result.message || "Failed to reject booking.", type: "danger" });
    }
    setActionId(null);
  };

  const statusClass = {
    pending: "badge-pending",
    confirmed: "badge-confirmed",
    rejected: "badge-rejected",
  };

  return (
    <>
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="container-xl py-4">
        <button
          className="btn-outline-custom mb-3"
          onClick={() => navigate("/owner-dashboard")}
          style={{ fontSize: "var(--text-sm)" }}
        >
          <i className="bi bi-arrow-left me-1"></i>Back to Dashboard
        </button>

        <div className="page-header">
          <h1>Booking Requests</h1>
          <p>Review and manage all incoming booking requests for your venues</p>
        </div>

        <div className="d-flex gap-2 mb-4 flex-wrap">
          {Object.entries(counts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={filter === key ? "btn-primary-custom" : "btn-outline-custom"}
              style={{ textTransform: "capitalize" }}
            >
              {key} <span style={{ opacity: 0.8, marginLeft: "0.3rem" }}>({count})</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state section-card">
            <i className="bi bi-inbox"></i>
            <h5>No {filter !== "all" ? filter : ""} bookings</h5>
            <p>When customers book your venues, requests will appear here.</p>
          </div>
        ) : (
          <div className="row g-3">
            {filtered.map((booking) => {
              const venue = getVenueById(booking.venue_id);
              const isActing = actionId === booking.id;
              return (
                <div key={booking.id} className="col-12">
                  <div className={`booking-card ${isActing ? "opacity-50" : ""}`} style={{ transition: "opacity 0.4s" }}>
                    <div className="row g-3 align-items-center">
                      {venue && (
                        <div className="col-md-1 col-2">
                          <img src={venue.images[0]} alt={venue.name}
                            style={{ width: "100%", height: "60px", objectFit: "cover", borderRadius: "var(--radius-md)" }} />
                        </div>
                      )}

                      <div className="col-md-4 col-10">
                        <div style={{ fontWeight: 700, fontSize: "var(--text-base)" }}>
                          <i className="bi bi-person-circle me-1" style={{ color: "var(--color-primary)" }}></i>
                          {booking.customerName}
                        </div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                          {booking.customerEmail}
                          {booking.customerPhone && ` · ${booking.customerPhone}`}
                        </div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                          <i className="bi bi-building me-1"></i>
                          {venue?.name || "Unknown Venue"}
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="d-flex flex-wrap gap-2" style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                          <span><i className="bi bi-calendar3 me-1"></i>{booking.date}</span>
                          <span><i className="bi bi-people me-1"></i>{booking.guests} guests</span>
                          <span><i className="bi bi-tag me-1"></i>{booking.eventType}</span>
                        </div>
                        {booking.specialRequests && (
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)", marginTop: "0.3rem" }}>
                            <i className="bi bi-chat-dots me-1"></i>{booking.specialRequests}
                          </div>
                        )}
                        <div style={{ fontWeight: 700, color: "var(--color-primary)", marginTop: "0.3rem" }}>
                          PKR {booking.total_amount?.toLocaleString()}
                        </div>
                      </div>

                      <div className="col-md-3 d-flex flex-column gap-2 align-items-start align-items-md-end">
                        <span className={`badge-status ${statusClass[booking.status]}`}>
                          {booking.status}
                        </span>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)" }}>
                          Requested: {new Date(booking.created_at).toLocaleDateString()}
                        </div>
                        {booking.status === "pending" && (
                          <div className="d-flex gap-2">
                            <button
                              className="btn-success-custom"
                              onClick={() => handleAccept(booking.id)}
                              disabled={isActing}
                            >
                              {isActing ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-check-lg me-1"></i>Accept</>}
                            </button>
                            <button
                              className="btn-danger-custom"
                              onClick={() => handleReject(booking.id)}
                              disabled={isActing}
                            >
                              <i className="bi bi-x-lg me-1"></i>Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}