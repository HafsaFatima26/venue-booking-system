import React, { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import Navbar from "../../components/shared/Navbar";
import FilterBar from "../../components/customer/FilterBar";
import VenueCard from "../../components/customer/VenueCard";

const DEFAULT_FILTERS = { location: "", capacity: "", maxPrice: "", date: "", search: "" };

export default function CustomerDashboard() {
  const { venues } = useApp();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      if (filters.location && v.location !== filters.location) return false;
      if (filters.capacity && v.capacity > Number(filters.capacity)) return false;
      if (filters.maxPrice && v.price > Number(filters.maxPrice)) return false;
      if (filters.search && !v.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [venues, filters]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <>
      <Navbar />
      <div className="container-xl py-4">
        {/* Page Header */}
        <div className="page-header d-flex align-items-center justify-content-between">
          <div>
            <h1>Explore Wedding Venues</h1>
            <p>Discover and book the perfect venue for your wedding</p>
          </div>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
            <i className="bi bi-grid-3x3-gap-fill me-1"></i>
            {filteredVenues.length} venue{filteredVenues.length !== 1 ? "s" : ""}
            {activeFilterCount > 0 && <span className="ms-1 badge-status badge-confirmed">{activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active</span>}
          </span>
        </div>

        {/* Filter Bar */}
        <FilterBar filters={filters} onChange={handleFilterChange} onReset={handleReset} />

        {/* Venue List */}
        {filteredVenues.length === 0 ? (
          <div className="empty-state section-card">
            <i className="bi bi-search"></i>
            <h5>No venues found</h5>
            <p>Try adjusting your filters to see more results.</p>
            <button className="btn-primary-custom" onClick={handleReset}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="venue-list-stack">
            {filteredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
