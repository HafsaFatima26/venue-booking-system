import React from "react";

export default function FilterBar({ filters, onChange, onReset }) {
  return (
    <div className="filter-bar mb-4">
      <div className="row g-3 align-items-end">
        <div className="col-6 col-md-3 col-lg-2">
          <label>Location</label>
          <select
            className="form-select"
            value={filters.location}
            onChange={(e) => onChange("location", e.target.value)}
          >
            <option value="">All</option>
            <option value="Karachi">Karachi</option>
            <option value="Lahore">Lahore</option>
            <option value="Islamabad">Islamabad</option>
          </select>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <label>Capacity</label>
          <select
            className="form-select"
            value={filters.capacity}
            onChange={(e) => onChange("capacity", e.target.value)}
          >
            <option value="">Any</option>
            <option value="100">Up to 100</option>
            <option value="200">Up to 200</option>
            <option value="300">Up to 300</option>
            <option value="500">Up to 500</option>
          </select>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <label>Max Price (PKR)</label>
          <select
            className="form-select"
            value={filters.maxPrice}
            onChange={(e) => onChange("maxPrice", e.target.value)}
          >
            <option value="">Any</option>
            <option value="50000">Up to 50,000</option>
            <option value="100000">Up to 1,00,000</option>
            <option value="150000">Up to 1,50,000</option>
            <option value="200000">Up to 2,00,000</option>
          </select>
        </div>
        <div className="col-6 col-md-3 col-lg-3">
          <label>Date</label>
          <input
            type="date"
            className="form-control"
            value={filters.date}
            onChange={(e) => onChange("date", e.target.value)}
          />
        </div>
        <div className="col-12 col-lg-2">
          <label>Search</label>
          <input
            type="text"
            className="form-control"
            placeholder="Venue name…"
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
          />
        </div>
        <div className="col-12 col-lg-1 d-flex align-items-end">
          <button onClick={onReset} className="btn-outline-custom w-100" title="Reset filters">
            <i className="bi bi-arrow-counterclockwise"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
