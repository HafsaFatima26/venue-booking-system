import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Navbar from "../../components/shared/Navbar";
import Toast from "../../components/shared/Toast";

export default function OwnerDetails() {
  const navigate = useNavigate();
  const { currentUser, updateOwnerProfile } = useApp();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", businessName: "", address: "", description: "",
  });
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        businessName: currentUser.businessName || "",
        address: currentUser.address || "",
        description: currentUser.description || "",
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email is required";
    return e;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    updateOwnerProfile(form);
    setEditing(false);
    setToast({ message: "Profile updated successfully!", type: "success" });
  };

  const handleCancel = () => {
    setForm({
      name: currentUser.name || "",
      email: currentUser.email || "",
      phone: currentUser.phone || "",
      businessName: currentUser.businessName || "",
      address: currentUser.address || "",
      description: currentUser.description || "",
    });
    setEditing(false);
    setErrors({});
  };

  const initials = form.name ? form.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <>
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="container-xl py-4">
        {/* Back button */}
        <button
          className="btn-outline-custom mb-3"
          onClick={() => navigate("/owner-dashboard")}
          style={{ fontSize: "var(--text-sm)" }}
        >
          <i className="bi bi-arrow-left me-1"></i>Back to Dashboard
        </button>

        <div className="page-header d-flex justify-content-between align-items-center">
          <div>
            <h1>Owner Profile</h1>
            <p>Manage your business details and contact information</p>
          </div>
          {!editing && (
            <button className="btn-primary-custom" onClick={() => setEditing(true)}>
              <i className="bi bi-pencil me-1"></i>Edit Profile
            </button>
          )}
        </div>

        <div className="row g-4">
          {/* Avatar Card */}
          <div className="col-md-3">
            <div className="section-card text-center">
              <div style={{
                width: "80px", height: "80px", borderRadius: "50%",
                background: "var(--color-primary)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.8rem", fontWeight: 700, margin: "0 auto 1rem"
              }}>
                {initials}
              </div>
              <h5 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{form.name || "—"}</h5>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
                {form.businessName || "Venue Owner"}
              </div>
              <span className="badge-status badge-confirmed">Owner Account</span>
              <hr style={{ borderColor: "var(--color-border)", margin: "1rem 0" }} />
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textAlign: "left" }}>
                <div className="mb-1"><i className="bi bi-envelope me-1"></i>{form.email || "—"}</div>
                <div className="mb-1"><i className="bi bi-phone me-1"></i>{form.phone || "—"}</div>
                <div><i className="bi bi-geo-alt me-1"></i>{form.address || "—"}</div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="col-md-9">
            <div className="section-card">
              <form onSubmit={handleSave} className="custom-form" noValidate>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label">Full Name *</label>
                    <input name="name" className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      value={form.name} onChange={handleChange} disabled={!editing} />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label">Email Address *</label>
                    <input type="email" name="email" className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      value={form.email} onChange={handleChange} disabled={!editing} />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label">Phone Number</label>
                    <input name="phone" className="form-control" value={form.phone} onChange={handleChange} disabled={!editing} placeholder="0321-XXXXXXX" />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label">Business Name</label>
                    <input name="businessName" className="form-control" value={form.businessName} onChange={handleChange} disabled={!editing} placeholder="e.g. Khan Venues & Events" />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Business Address</label>
                    <input name="address" className="form-control" value={form.address} onChange={handleChange} disabled={!editing} placeholder="e.g. Block 5, Clifton, Karachi" />
                  </div>
                  <div className="col-12">
                    <label className="form-label">About / Description</label>
                    <textarea name="description" className="form-control" rows={3} value={form.description}
                      onChange={handleChange} disabled={!editing}
                      placeholder="Tell customers about your experience and services…" />
                  </div>
                </div>

                {editing && (
                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn-primary-custom">
                      <i className="bi bi-check-circle me-1"></i>Save Changes
                    </button>
                    <button type="button" className="btn-outline-custom" onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>
                )}

                {!editing && (
                  <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>
                    <i className="bi bi-info-circle me-1"></i>
                    Click <strong>Edit Profile</strong> above to update your information.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
