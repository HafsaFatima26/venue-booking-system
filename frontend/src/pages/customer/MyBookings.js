import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Navbar from "../../components/shared/Navbar";
import Toast from "../../components/shared/Toast";

export default function MyBookings() {
  const { getBookingsForCustomer, cancelBooking, getVenueById } = useApp();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const bookings = getBookingsForCustomer();

  const handleCancel = (id) => {
    setCancellingId(id);
    setTimeout(() => {
      cancelBooking(id);
      setToast({ message: "Booking cancelled successfully.", type: "danger" });
      setCancellingId(null);
    }, 700);
  };

  const statusClass = { pending: "badge-pending", confirmed: "badge-confirmed", rejected: "badge-rejected" };

  return (
    <>
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="container-lg py-4">
        <div className="page-header d-flex justify-content-between align-items-center">
          <div>
            <h1>My Bookings</h1>
            <p>Track and manage all your venue reservations</p>
          </div>
          <button className="btn-primary-custom" onClick={() => navigate("/customer-dashboard")}>
            <i className="bi bi-plus me-1"></i>Book a Venue
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state section-card">
            <i className="bi bi-calendar-x"></i>
            <h5>No bookings yet</h5>
            <p>You haven't made any bookings. Explore venues and book your first event!</p>
            <button className="btn-primary-custom" onClick={() => navigate("/customer-dashboard")}>
              Explore Venues
            </button>
          </div>
        ) : (
          <div className="row g-3">
            {bookings.map((booking) => {
              const venue = getVenueById(booking.venueId);
              return (
                <div key={booking.id} className="col-12">
                  <div className={`booking-card ${cancellingId === booking.id ? "opacity-50" : ""}`}
                    style={{ transition: "opacity 0.4s" }}>
                    <div className="row align-items-center g-3">
                      {venue && (
                        <div className="col-md-2 col-3">
                          <img src={venue.images[0]} alt={venue.name}
                            style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "var(--radius-md)" }} />
                        </div>
                      )}
                      <div className="col-md-5 col-9">
                        <h6 style={{ fontWeight: 700, marginBottom: "0.2rem" }}>{venue?.name || "Unknown Venue"}</h6>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }} className="d-flex flex-wrap gap-2">
                          <span><i className="bi bi-calendar3 me-1"></i>{booking.date}</span>
                          <span><i className="bi bi-people me-1"></i>{booking.guests} guests</span>
                          <span><i className="bi bi-tag me-1"></i>{booking.eventType}</span>
                          {venue && <span><i className="bi bi-geo-alt me-1"></i>{venue.location}</span>}
                        </div>
                        {booking.specialRequests && (
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)", marginTop: "0.3rem" }}>
                            <i className="bi bi-chat-left-dots me-1"></i>{booking.specialRequests}
                          </div>
                        )}
                      </div>
                      <div className="col-md-3 d-flex flex-column gap-1">
                        <span className={`badge-status ${statusClass[booking.status] || "badge-pending"}`}>
                          {booking.status}
                        </span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                          Booked: {booking.createdAt}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-primary)" }}>
                          PKR {booking.totalAmount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="col-md-2 d-flex flex-column gap-2">
                        {venue && (
                          <button className="btn-outline-custom" onClick={() => navigate(`/venue/${venue.id}`)}>
                            <i className="bi bi-eye me-1"></i>View
                          </button>
                        )}
                        {booking.status !== "rejected" && (
                          <button
                            className="btn-danger-custom"
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancellingId === booking.id}
                          >
                            {cancellingId === booking.id
                              ? <span className="spinner-border spinner-border-sm"></span>
                              : <><i className="bi bi-x-circle me-1"></i>Cancel</>}
                          </button>
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
