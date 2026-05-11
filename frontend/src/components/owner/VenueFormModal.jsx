import React, { useState, useEffect } from "react";

const EMPTY = {
  name: "", location: "Karachi", type: "Wedding", price: "", capacity: "",
  description: "", amenities: "", images: "",
};

export default function VenueFormModal({ show, onClose, onSave, editVenue }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editVenue) {
      setForm({
        ...editVenue,
        amenities: editVenue.amenities?.join(", ") || "",
        images: editVenue.images?.join(", ") || "",
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [editVenue, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = "Enter a valid price";
    if (!form.capacity || isNaN(form.capacity) || Number(form.capacity) <= 0) e.capacity = "Enter a valid capacity";
    if (!form.description.trim()) e.description = "Description is required";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    const amenitiesArr = form.amenities
      ? form.amenities.split(",").map((a) => a.trim()).filter(Boolean)
      : [];
    const imagesArr = form.images
      ? form.images.split(",").map((i) => i.trim()).filter(Boolean)
      : [];
    onSave({
      ...form,
      price: Number(form.price),
      capacity: Number(form.capacity),
      amenities: amenitiesArr,
      images: imagesArr.length ? imagesArr : [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80"
      ],
    });
    onClose();
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--color-surface)", borderRadius: "var(--radius-xl)",
        width: "100%", maxWidth: "580px", maxHeight: "90vh", overflow: "auto",
        boxShadow: "var(--shadow-lg)"
      }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h5 style={{ margin: 0, fontWeight: 700 }}>
            <i className={`bi ${editVenue ? "bi-pencil-square" : "bi-plus-circle"} me-2`} style={{ color: "var(--color-primary)" }}></i>
            {editVenue ? "Edit Venue" : "Add New Venue"}
          </h5>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.3rem", color: "var(--color-text-muted)", lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="custom-form" style={{ padding: "1.5rem" }} noValidate>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Venue Name *</label>
              <input name="name" className={`form-control ${errors.name ? "is-invalid" : ""}`} value={form.name} onChange={handleChange} placeholder="e.g. The Grand Ballroom" />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="col-sm-6">
              <label className="form-label">Location</label>
              <select name="location" className="form-select" value={form.location} onChange={handleChange}>
                <option>Karachi</option><option>Lahore</option><option>Islamabad</option><option>Rawalpindi</option><option>Multan</option>
              </select>
            </div>
            <div className="col-sm-6">
              <label className="form-label">Type</label>
              <select name="type" className="form-select" value={form.type} onChange={handleChange}>
                <option>Wedding</option><option>Corporate</option><option>Conference</option><option>Party</option>
              </select>
            </div>
            <div className="col-sm-6">
              <label className="form-label">Price (PKR) *</label>
              <input type="number" name="price" className={`form-control ${errors.price ? "is-invalid" : ""}`} value={form.price} onChange={handleChange} placeholder="e.g. 80000" min={1} />
              {errors.price && <div className="invalid-feedback">{errors.price}</div>}
            </div>
            <div className="col-sm-6">
              <label className="form-label">Capacity *</label>
              <input type="number" name="capacity" className={`form-control ${errors.capacity ? "is-invalid" : ""}`} value={form.capacity} onChange={handleChange} placeholder="Max guests" min={1} />
              {errors.capacity && <div className="invalid-feedback">{errors.capacity}</div>}
            </div>
            <div className="col-12">
              <label className="form-label">Description *</label>
              <textarea name="description" className={`form-control ${errors.description ? "is-invalid" : ""}`} rows={3} value={form.description} onChange={handleChange} placeholder="Describe the venue…" />
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>
            <div className="col-12">
              <label className="form-label">Amenities <span style={{ color: "var(--color-text-faint)", fontWeight: 400 }}>(comma-separated)</span></label>
              <input name="amenities" className="form-control" value={form.amenities} onChange={handleChange} placeholder="Parking, Catering, AC, Stage…" />
            </div>
            <div className="col-12">
              <label className="form-label">Image URLs <span style={{ color: "var(--color-text-faint)", fontWeight: 400 }}>(comma-separated, optional)</span></label>
              <input name="images" className="form-control" value={form.images} onChange={handleChange} placeholder="https://…, https://…" />
            </div>
          </div>
          <div className="d-flex gap-2 mt-4 justify-content-end">
            <button type="button" className="btn-outline-custom" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary-custom">
              <i className={`bi ${editVenue ? "bi-check-circle" : "bi-plus-circle"} me-1`}></i>
              {editVenue ? "Save Changes" : "Add Venue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
