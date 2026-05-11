import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Navbar from "../../components/shared/Navbar";
import Toast from "../../components/shared/Toast";

export default function BookingPage() {
  const { state } = useLocation();

  const navigate = useNavigate();

  const {
    getVenueById,
    addBooking,
    currentUser,
    authLoading,
  } = useApp();

  const venue = getVenueById(state?.venueId);

  // ─────────────────────────────────────────────
  // REDIRECT WRONG USERS
  // ─────────────────────────────────────────────
  React.useEffect(() => {
    // WAIT UNTIL SESSION RESTORE COMPLETES
    if (authLoading) return;

    if (currentUser && currentUser.role !== "customer") {
      navigate(
        currentUser.role === "owner"
          ? "/owner-dashboard"
          : "/login",
        { replace: true }
      );
    }
  }, [currentUser, authLoading, navigate]);

  // ─────────────────────────────────────────────
  // FORM STATE
  // ─────────────────────────────────────────────
  const [form, setForm] = useState({
    date: "",
    guests: "",
    eventType: venue?.type || "Other",
    specialRequests: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────────
  // HANDLE INPUT CHANGE
  // ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // ─────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!form.date) {
      newErrors.date = "Please select a date";
    }

    if (!form.guests || form.guests < 1) {
      newErrors.guests = "Enter number of guests";
    }

    if (venue && form.guests > venue.capacity) {
      newErrors.guests = `Max capacity is ${venue.capacity}`;
    }

    if (!form.cardName) {
      newErrors.cardName = "Name on card is required";
    }

    if (
      !form.cardNumber ||
      form.cardNumber.replace(/\s/g, "").length < 16
    ) {
      newErrors.cardNumber =
        "Enter a valid 16-digit card number";
    }

    if (!form.expiry) {
      newErrors.expiry = "Expiry is required";
    }

    if (!form.cvv || form.cvv.length < 3) {
      newErrors.cvv = "Enter valid CVV";
    }

    return newErrors;
  };

  // ─────────────────────────────────────────────
  // SUBMIT BOOKING
  // ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // WAIT FOR SESSION RESTORE
    if (authLoading) {
      return;
    }

    // USER NOT LOGGED IN
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // WRONG ROLE
    if (currentUser.role !== "customer") {
      setToast({
        message:
          "Please login as a customer to book a venue.",
        type: "danger",
      });

      return;
    }

    // VALIDATE FORM
    const v = validate();

    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    setLoading(true);

    try {
      // SMALL LOADER DELAY
      await new Promise((resolve) =>
        setTimeout(resolve, 1200)
      );

      const result = await addBooking({
        venueId: venue.id,
        customerName: currentUser.full_name,
        customerEmail: currentUser.email,
        customerPhone: currentUser.phone || "",
        date: form.date,
        guests: Number(form.guests),
        eventType: form.eventType,
        specialRequests: form.specialRequests,
        totalAmount: venue.price,
      });

      if (result.success) {
        setToast({
          message: "Booking confirmed! Redirecting…",
          type: "success",
        });

        setTimeout(() => {
          navigate("/my-bookings");
        }, 1500);
      } else {
        setToast({
          message:
            result.message ||
            "Unable to complete booking.",
          type: "danger",
        });
      }
    } catch (err) {
      console.error(err);

      setToast({
        message: "Something went wrong.",
        type: "danger",
      });
    }

    setLoading(false);
  };

  // ─────────────────────────────────────────────
  // FORMAT CARD
  // ─────────────────────────────────────────────
  const formatCard = (val) => {
    return val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  // ─────────────────────────────────────────────
  // NO VENUE
  // ─────────────────────────────────────────────
  if (!venue) {
    return (
      <>
        <Navbar />

        <div className="container py-5 text-center">
          <h4>
            No venue selected.

            <button
              className="btn-primary-custom ms-2"
              onClick={() =>
                navigate("/customer-dashboard")
              }
            >
              Browse Venues
            </button>
          </h4>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <>
      <Navbar />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="container-lg py-4">
        {/* BREADCRUMB */}
        <nav className="mb-3">
          <ol
            className="breadcrumb"
            style={{ fontSize: "var(--text-sm)" }}
          >
            <li className="breadcrumb-item">
              <button
                onClick={() =>
                  navigate("/customer-dashboard")
                }
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-primary)",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                Venues
              </button>
            </li>

            <li className="breadcrumb-item">
              <button
                onClick={() =>
                  navigate(`/venue/${venue.id}`)
                }
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-primary)",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                {venue.name}
              </button>
            </li>

            <li className="breadcrumb-item active">
              Book
            </li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* FORM */}
          <div className="col-lg-7">
            <form
              onSubmit={handleSubmit}
              className="custom-form"
              noValidate
            >
              {/* EVENT DETAILS */}
              <div className="section-card mb-4">
                <h5
                  style={{
                    fontWeight: 700,
                    marginBottom: "1.25rem",
                  }}
                >
                  <i
                    className="bi bi-calendar3 me-2"
                    style={{
                      color: "var(--color-primary)",
                    }}
                  ></i>

                  Event Details
                </h5>

                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label">
                      Event Date *
                    </label>

                    <input
                      type="date"
                      name="date"
                      className={`form-control ${
                        errors.date ? "is-invalid" : ""
                      }`}
                      value={form.date}
                      onChange={handleChange}
                      min={
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                    />

                    {errors.date && (
                      <div className="invalid-feedback">
                        {errors.date}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label">
                      Number of Guests *
                    </label>

                    <input
                      type="number"
                      name="guests"
                      className={`form-control ${
                        errors.guests
                          ? "is-invalid"
                          : ""
                      }`}
                      value={form.guests}
                      onChange={handleChange}
                      placeholder={`Max ${venue.capacity}`}
                      min={1}
                      max={venue.capacity}
                    />

                    {errors.guests && (
                      <div className="invalid-feedback">
                        {errors.guests}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label">
                      Event Type
                    </label>

                    <select
                      name="eventType"
                      className="form-select"
                      value={form.eventType}
                      onChange={handleChange}
                    >
                      <option value="Wedding">
                        Wedding
                      </option>

                      <option value="Corporate">
                        Corporate
                      </option>

                      <option value="Conference">
                        Conference
                      </option>

                      <option value="Party">
                        Party
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Special Requests
                    </label>

                    <textarea
                      name="specialRequests"
                      className="form-control"
                      rows={3}
                      value={form.specialRequests}
                      onChange={handleChange}
                      placeholder="Dietary needs, setup preferences, accessibility requirements…"
                    />
                  </div>
                </div>
              </div>

              {/* PAYMENT */}
              <div className="section-card mb-4">
                <h5
                  style={{
                    fontWeight: 700,
                    marginBottom: "1.25rem",
                  }}
                >
                  <i
                    className="bi bi-credit-card me-2"
                    style={{
                      color: "var(--color-primary)",
                    }}
                  ></i>

                  Payment Information

                  <span
                    className="badge-status badge-confirmed ms-2"
                    style={{ fontSize: "0.65rem" }}
                  >
                    <i className="bi bi-lock-fill me-1"></i>
                    Secure
                  </span>
                </h5>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">
                      Name on Card *
                    </label>

                    <input
                      type="text"
                      name="cardName"
                      className={`form-control ${
                        errors.cardName
                          ? "is-invalid"
                          : ""
                      }`}
                      value={form.cardName}
                      onChange={handleChange}
                      placeholder="Muhammad Taha"
                    />

                    {errors.cardName && (
                      <div className="invalid-feedback">
                        {errors.cardName}
                      </div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Card Number *
                    </label>

                    <input
                      type="text"
                      name="cardNumber"
                      className={`form-control ${
                        errors.cardNumber
                          ? "is-invalid"
                          : ""
                      }`}
                      value={form.cardNumber}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          cardNumber: formatCard(
                            e.target.value
                          ),
                        }))
                      }
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />

                    {errors.cardNumber && (
                      <div className="invalid-feedback">
                        {errors.cardNumber}
                      </div>
                    )}
                  </div>

                  <div className="col-6">
                    <label className="form-label">
                      Expiry *
                    </label>

                    <input
                      type="month"
                      name="expiry"
                      className={`form-control ${
                        errors.expiry
                          ? "is-invalid"
                          : ""
                      }`}
                      value={form.expiry}
                      onChange={handleChange}
                    />

                    {errors.expiry && (
                      <div className="invalid-feedback">
                        {errors.expiry}
                      </div>
                    )}
                  </div>

                  <div className="col-6">
                    <label className="form-label">
                      CVV *
                    </label>

                    <input
                      type="password"
                      name="cvv"
                      className={`form-control ${
                        errors.cvv ? "is-invalid" : ""
                      }`}
                      value={form.cvv}
                      onChange={handleChange}
                      placeholder="•••"
                      maxLength={4}
                    />

                    {errors.cvv && (
                      <div className="invalid-feedback">
                        {errors.cvv}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="btn-primary-custom w-100"
                style={{
                  padding: "0.85rem",
                  fontSize: "var(--text-base)",
                }}
                disabled={loading || authLoading}
              >
                {authLoading ? (
                  <>Loading Session...</>
                ) : loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing…
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Confirm Booking – PKR{" "}
                    {venue.price.toLocaleString()}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ORDER SUMMARY */}
          <div className="col-lg-5">
            <div
              className="section-card"
              style={{
                position: "sticky",
                top: "80px",
              }}
            >
              <h5
                style={{
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                Order Summary
              </h5>

              <img
                src={venue.images[0]}
                alt={venue.name}
                style={{
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "1rem",
                }}
              />

              <h6 style={{ fontWeight: 700 }}>
                {venue.name}
              </h6>

              <div
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                }}
                className="mb-3"
              >
                <i
                  className="bi bi-geo-alt-fill me-1"
                  style={{
                    color: "var(--color-accent)",
                  }}
                ></i>

                {venue.location} ·

                <span className="ms-1">
                  <i className="bi bi-people-fill me-1"></i>
                  Up to {venue.capacity} guests
                </span>
              </div>

              <hr
                style={{
                  borderColor: "var(--color-border)",
                }}
              />

              <div
                className="d-flex justify-content-between mb-2"
                style={{
                  fontSize: "var(--text-sm)",
                }}
              >
                <span>Venue Hire</span>

                <span>
                  PKR {venue.price.toLocaleString()}
                </span>
              </div>

              <div
                className="d-flex justify-content-between mb-2"
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                }}
              >
                <span>Service Fee</span>

                <span>PKR 0</span>
              </div>

              <hr
                style={{
                  borderColor: "var(--color-border)",
                }}
              />

              <div
                className="d-flex justify-content-between"
                style={{
                  fontWeight: 700,
                  fontSize: "var(--text-lg)",
                }}
              >
                <span>Total</span>

                <span
                  style={{
                    color: "var(--color-primary)",
                  }}
                >
                  PKR {venue.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}