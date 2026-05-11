import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

import {
  INITIAL_VENUES,
  INITIAL_BOOKINGS,
} from "../data/dummyData";

const AppContext = createContext();

// ─────────────────────────────────────────────────────────────
// BroadcastChannel names — one channel per data type.
// Any tab that mutates data posts a message here; every other
// tab (and the same tab) receives it and re-fetches instantly.
// ─────────────────────────────────────────────────────────────
const BOOKING_CHANNEL = "bookings_sync";
const VENUE_CHANNEL   = "venues_sync";

const MSG = {
  BOOKING_CHANGED: "BOOKING_CHANGED",
  VENUE_CHANGED:   "VENUE_CHANGED",
};

export function AppProvider({ children }) {

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  const [currentUser,      setCurrentUser]      = useState(null);
  const [venues,           setVenues]           = useState([]);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [ownerBookings,    setOwnerBookings]    = useState([]);
  const [authLoading,      setAuthLoading]      = useState(true);

  // Ref so channel callbacks always see the latest user
  // without needing to re-subscribe the channel on every render
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // ─────────────────────────────────────────────
  // BROADCAST CHANNELS (created once on mount)
  // ─────────────────────────────────────────────
  const bookingChannelRef = useRef(null);
  const venueChannelRef   = useRef(null);

  useEffect(() => {
    bookingChannelRef.current = new BroadcastChannel(BOOKING_CHANNEL);
    venueChannelRef.current   = new BroadcastChannel(VENUE_CHANNEL);

    // When ANY tab changes a venue → every tab re-fetches venues
    venueChannelRef.current.onmessage = (e) => {
      if (e.data?.type === MSG.VENUE_CHANGED) {
        fetchVenues();
      }
    };

    // When ANY tab changes a booking → every tab re-fetches its own bookings
    bookingChannelRef.current.onmessage = (e) => {
      if (e.data?.type === MSG.BOOKING_CHANGED) {
        const user = currentUserRef.current;
        if (user) fetchBookingsForUser(user);
      }
    };

    return () => {
      bookingChannelRef.current?.close();
      venueChannelRef.current?.close();
    };
  }, []); // runs once only

  // ─────────────────────────────────────────────
  // BROADCAST HELPERS
  // ─────────────────────────────────────────────
  const broadcastBookingChange = () =>
    bookingChannelRef.current?.postMessage({ type: MSG.BOOKING_CHANGED });

  const broadcastVenueChange = () =>
    venueChannelRef.current?.postMessage({ type: MSG.VENUE_CHANGED });

  // ─────────────────────────────────────────────
  // AUTH HEADERS
  // ─────────────────────────────────────────────
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ─────────────────────────────────────────────
  // RESTORE SESSION
  // ─────────────────────────────────────────────
  const restoreSession = async () => {
    setAuthLoading(true);
    const token = localStorage.getItem("token");
    if (!token) { setAuthLoading(false); return; }

    try {
      const res  = await fetch("http://localhost:5000/api/auth/me", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
      } else {
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.error("Session restore failed:", err);
      localStorage.removeItem("token");
    }

    setAuthLoading(false);
  };

  // ─────────────────────────────────────────────
  // INITIAL LOAD
  // ─────────────────────────────────────────────
  useEffect(() => {
    restoreSession();
  }, []);

  // ─────────────────────────────────────────────
  // FETCH ON LOGIN / USER CHANGE
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchVenues();
    if (currentUser) fetchBookingsForUser(currentUser);
  }, [currentUser]);

  // ─────────────────────────────────────────────
  // VISIBILITY REFRESH
  // Re-fetch when the user switches back to this tab
  // in case they were away while changes happened elsewhere
  // ─────────────────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchVenues();
        const user = currentUserRef.current;
        if (user) fetchBookingsForUser(user);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ─────────────────────────────────────────────
  // FALLBACK POLLING — 15 s safety net only
  // BroadcastChannel handles real-time push.
  // This catches anything that slips through
  // (e.g. server-side admin changes, network blips).
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      fetchBookingsForUser(currentUser);
    }, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // ─────────────────────────────────────────────
  // NORMALIZE BOOKING SHAPE
  // ─────────────────────────────────────────────
  const normalizeBooking = (booking) => ({
    ...booking,
    date:          booking.event_date     || booking.date,
    eventType:     booking.event_type     || booking.eventType,
    customerName:  booking.customer_name  || booking.customerName,
    customerEmail: booking.customer_email || booking.customerEmail,
    customerPhone: booking.customer_phone || booking.customerPhone,
  });

  // ─────────────────────────────────────────────
  // FETCH VENUES
  // ─────────────────────────────────────────────
  const fetchVenues = async () => {
    try {
      const res  = await fetch("http://localhost:5000/api/venues");
      const data = await res.json();
      if (data.success) {
        setVenues(
          data.data.map((v) => ({
            ...v,
            type:      v.venue_type || v.type || "Other",
            images:    ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80"],
            available: true,
            amenities: v.amenities    || [],
            reviews:   v.review_count || 0,
          }))
        );
      }
    } catch (err) {
      console.error(err);
      setVenues(INITIAL_VENUES);
    }
  };

  // ─────────────────────────────────────────────
  // FETCH BOOKINGS
  // Accepts a user object directly so it works from
  // BroadcastChannel callbacks (which run outside React
  // render cycle and can't rely on currentUser state).
  // ─────────────────────────────────────────────
  const fetchBookingsForUser = async (user) => {
    if (!user) return;
    try {
      const endpoint = user.role === "customer"
        ? "/api/bookings/customer"
        : "/api/bookings/owner";

      const res  = await fetch(`http://localhost:5000${endpoint}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (data.success) {
        const normalized = data.data.map(normalizeBooking);
        if (user.role === "customer") {
          setCustomerBookings(normalized);
        } else {
          setOwnerBookings(normalized);
        }
      }
    } catch (err) {
      console.error(err);
      if (user.role === "customer") {
        setCustomerBookings(INITIAL_BOOKINGS);
      } else {
        setOwnerBookings(INITIAL_BOOKINGS);
      }
    }
  };

  // Convenience wrapper for places that have currentUser in scope
  const fetchBookings = () => fetchBookingsForUser(currentUserRef.current);

  // ─────────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────────
  const login = async (role, username, password) => {
    try {
      localStorage.removeItem("token");
      const res  = await fetch(`http://localhost:5000/api/auth/${role}/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.user.role !== role) {
          localStorage.removeItem("token");
          return { success: false, message: "Logged in role does not match selected role." };
        }
        localStorage.setItem("token", data.token);
        setCurrentUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch {
      localStorage.removeItem("token");
      return { success: false, message: "Server error" };
    }
  };

  const register = async (role, userData) => {
    try {
      localStorage.removeItem("token");
      const res  = await fetch(`http://localhost:5000/api/auth/${role}/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success) {
        if (data.user.role !== role) {
          localStorage.removeItem("token");
          return { success: false, message: "Registered role mismatch." };
        }
        localStorage.setItem("token", data.token);
        setCurrentUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch {
      localStorage.removeItem("token");
      return { success: false, message: "Server error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setCustomerBookings([]);
    setOwnerBookings([]);
  };

  // ─────────────────────────────────────────────
  // VENUE CRUD
  // Pattern for every mutation:
  //   1. Call API
  //   2. Optimistically update local state  → instant UI in this tab
  //   3. fetchVenues()                       → sync this tab with server truth
  //   4. broadcastVenueChange()              → all other tabs re-fetch instantly
  // ─────────────────────────────────────────────
  const addVenue = async (venueData) => {
    try {
      const res  = await fetch("http://localhost:5000/api/venues", {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body:    JSON.stringify({
          ...venueData,
          venue_type: venueData.type || venueData.venue_type,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchVenues();
        broadcastVenueChange();
        return { success: true };
      }
      return { success: false, message: data.message || "Add venue failed" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Server error" };
    }
  };

  const updateVenue = async (id, venueData) => {
    try {
      const res  = await fetch(`http://localhost:5000/api/venues/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body:    JSON.stringify({
          ...venueData,
          venue_type: venueData.type || venueData.venue_type,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistic update for instant feedback in this tab
        setVenues((prev) =>
          prev.map((v) =>
            v.id === id
              ? { ...v, ...venueData, type: venueData.type || venueData.venue_type || v.type }
              : v
          )
        );
        await fetchVenues();
        broadcastVenueChange();
        return { success: true };
      }
      return { success: false, message: data.message || "Update venue failed" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Server error" };
    }
  };

  const deleteVenue = async (id) => {
    try {
      const res  = await fetch(`http://localhost:5000/api/venues/${id}`, {
        method:  "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        await fetchVenues();
        broadcastVenueChange();
        return { success: true };
      }
      return { success: false, message: data.message || "Unable to delete venue" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Server error" };
    }
  };

  // ─────────────────────────────────────────────
  // BOOKING CRUD
  // Same pattern: optimistic update → fetch → broadcast
  // ─────────────────────────────────────────────
  const addBooking = async (bookingData) => {
    try {
      const res  = await fetch("http://localhost:5000/api/bookings", {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body:    JSON.stringify({
          venue_id:           bookingData.venueId,
          event_date:         bookingData.date,
          guests:             bookingData.guests,
          event_type:         bookingData.eventType,
          special_requests:   bookingData.specialRequests,
          total_amount:       bookingData.totalAmount || 0,
          payment_card_last4: "1234",
          payment_card_name:  "Mock Card",
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newBooking = normalizeBooking(data.data);
        // Optimistic instant add for the customer
        setCustomerBookings((prev) => [...prev, newBooking]);
        await fetchBookings();
        // Tell owner tabs a new booking arrived
        broadcastBookingChange();
        return { success: true, data };
      }
      return { success: false, message: data.message || "Booking failed" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Server error" };
    }
  };

  const cancelBooking = async (id) => {
    try {
      const res  = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method:  "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistic instant removal for the customer
        setCustomerBookings((prev) => prev.filter((b) => b.id !== id));
        await fetchBookings();
        // Tell owner tabs this booking was cancelled
        broadcastBookingChange();
        return { success: true };
      }
      return { success: false, message: data.message || "Cancel failed" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Server error" };
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const res  = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body:    JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistic instant update for the owner
        setOwnerBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        );
        await fetchBookings();
        // Tell customer tabs their booking status changed
        broadcastBookingChange();
        return { success: true };
      }
      return { success: false, message: data.message || "Update failed" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Server error" };
    }
  };

  const acceptBooking = (id) => updateBookingStatus(id, "confirmed");
  const rejectBooking = (id) => updateBookingStatus(id, "rejected");

  // ─────────────────────────────────────────────
  // OWNER PROFILE
  // ─────────────────────────────────────────────
  const updateOwnerProfile = async (profileData) => {
    try {
      const res    = await fetch("http://localhost:5000/api/auth/owner/profile", {
        method:  "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body:    JSON.stringify(profileData),
      });
      const result = await res.json();
      if (result.success && result.user) {
        setCurrentUser(result.user);
        return { success: true };
      }
      return { success: false, message: result.message || "Update failed" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Server error" };
    }
  };

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  const getVenueById = (id) =>
    venues.find((v) => v.id === Number(id) || v.id === id);

  const getBookingsForCustomer = () => customerBookings;
  const getBookingsForOwner    = () => ownerBookings;
  const getVenuesForOwner      = () =>
    venues.filter((v) => v.owner_id === currentUser?.id);

  // ─────────────────────────────────────────────
  // PROVIDER
  // ─────────────────────────────────────────────
  return (
    <AppContext.Provider
      value={{
        currentUser,
        authLoading,

        venues,

        // Unified bookings (backward compat for any component using `bookings` directly)
        bookings: currentUser?.role === "customer" ? customerBookings : ownerBookings,

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