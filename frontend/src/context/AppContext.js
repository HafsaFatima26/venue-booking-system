import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_VENUES, INITIAL_BOOKINGS } from "../data/dummyData";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchVenues();
    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser]);

  const fetchVenues = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/venues');
      const data = await res.json();
      if (data.success) {
        setVenues(data.data.map(v => ({
          ...v,
          images: ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80"],
          available: true,
          amenities: v.amenities || [],
          reviews: v.review_count || 0
        })));
      }
    } catch (err) {
      console.error(err);
      setVenues(INITIAL_VENUES); // fallback
    }
  };

  const fetchBookings = async () => {
    try {
      const endpoint = currentUser.role === 'customer' ? '/api/bookings/customer' : '/api/bookings/owner';
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error(err);
      setBookings(INITIAL_BOOKINGS); // fallback
    }
  };

  // ── AUTH ──────────────────────────────────────────
  const login = async (role, username, password) => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/${role}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server error' };
    }
  };

  const register = async (role, userData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/${role}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // ── VENUE CRUD ────────────────────────────────────
  const addVenue = async (venueData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/venues`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(venueData)
      });
      const data = await res.json();
      if (data.success) {
        fetchVenues();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateVenue = async (id, venueData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/venues/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(venueData)
      });
      const data = await res.json();
      if (data.success) {
        fetchVenues();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteVenue = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/venues/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchVenues();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── BOOKING CRUD ──────────────────────────────────
  const addBooking = async (bookingData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          venue_id: bookingData.venueId,
          event_date: bookingData.date,
          guests: bookingData.guests,
          event_type: bookingData.eventType,
          special_requests: bookingData.specialRequests,
          total_amount: bookingData.totalAmount || 0,
          payment_card_last4: "1234", // mock card for now
          payment_card_name: "Mock Card"
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cancelBooking = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const acceptBooking = (id) => updateBookingStatus(id, 'confirmed');
  const rejectBooking = (id) => updateBookingStatus(id, 'rejected');

  // ── OWNER PROFILE ─────────────────────────────────
  const updateOwnerProfile = (data) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
  };

  // ── HELPERS ───────────────────────────────────────
  const getVenueById = (id) => venues.find((v) => v.id === Number(id) || v.id === id);

  const getBookingsForCustomer = () => bookings; // since api/bookings/customer returns only theirs

  const getBookingsForOwner = () => bookings; // since api/bookings/owner returns only theirs

  const getVenuesForOwner = () => venues.filter((v) => v.owner_id === currentUser?.id);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        venues,
        bookings,
        login,
        register,
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
