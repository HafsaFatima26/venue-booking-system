import React, { createContext, useContext, useState } from "react";
import { INITIAL_VENUES, INITIAL_BOOKINGS, USERS } from "../data/dummyData";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [venues, setVenues] = useState(INITIAL_VENUES);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);

  // ── AUTH ──────────────────────────────────────────
  const loginAsCustomer = () => {
    setCurrentUser(USERS.find((u) => u.role === "customer"));
  };

  const loginAsOwner = () => {
    setCurrentUser(USERS.find((u) => u.role === "owner"));
  };

  const logout = () => setCurrentUser(null);

  // ── VENUE CRUD ────────────────────────────────────
  const addVenue = (venueData) => {
    const newVenue = {
      ...venueData,
      id: Date.now(),
      ownerId: currentUser?.id || 1,
      rating: 0,
      reviews: 0,
      available: true,
      images: venueData.images?.length
        ? venueData.images
        : ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80"],
    };
    setVenues((prev) => [newVenue, ...prev]);
    return newVenue;
  };

  const updateVenue = (id, data) => {
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, ...data } : v)));
  };

  const deleteVenue = (id) => {
    setVenues((prev) => prev.filter((v) => v.id !== id));
  };

  // ── BOOKING CRUD ──────────────────────────────────
  const addBooking = (bookingData) => {
    const newBooking = {
      ...bookingData,
      id: Date.now(),
      customerId: currentUser?.id || 3,
      customerName: currentUser?.name || "",
      customerEmail: currentUser?.email || "",
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const cancelBooking = (id) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const acceptBooking = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "confirmed" } : b))
    );
  };

  const rejectBooking = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "rejected" } : b))
    );
  };

  // ── OWNER PROFILE ─────────────────────────────────
  const updateOwnerProfile = (data) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
  };

  // ── HELPERS ───────────────────────────────────────
  const getVenueById = (id) => venues.find((v) => v.id === Number(id));

  const getBookingsForCustomer = () =>
    bookings.filter((b) => b.customerId === currentUser?.id);

  const getBookingsForOwner = () => {
    const ownerVenueIds = venues
      .filter((v) => v.ownerId === currentUser?.id)
      .map((v) => v.id);
    return bookings.filter((b) => ownerVenueIds.includes(b.venueId));
  };

  const getVenuesForOwner = () =>
    venues.filter((v) => v.ownerId === currentUser?.id);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        venues,
        bookings,
        loginAsCustomer,
        loginAsOwner,
        logout,
        addVenue,
        updateVenue,
        deleteVenue,
        addBooking,
        cancelBooking,
        acceptBooking,
        rejectBooking,
        updateOwnerProfile,
        getVenueById,
        getBookingsForCustomer,
        getBookingsForOwner,
        getVenuesForOwner,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
