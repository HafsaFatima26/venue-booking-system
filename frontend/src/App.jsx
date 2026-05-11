import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

// Pages
import LoginPage from "./pages/LoginPage";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import VenueDetails from "./pages/customer/VenueDetails";
import BookingPage from "./pages/customer/BookingPage";
import MyBookings from "./pages/customer/MyBookings";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerBookings from "./pages/owner/OwnerBookings";
import OwnerDetails from "./pages/owner/OwnerDetails";
import ProtectedRoute from "./components/shared/ProtectedRoute";

// Styles
import "./styles/global.css";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Customer routes */}
          <Route
            path="/customer-dashboard"
            element={
              <ProtectedRoute role="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/venue/:id"
            element={
              <ProtectedRoute role="customer">
                <VenueDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute role="customer">
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute role="customer">
                <MyBookings />
              </ProtectedRoute>
            }
          />

          {/* Owner routes */}
          <Route
            path="/owner-dashboard"
            element={
              <ProtectedRoute role="owner">
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner-bookings"
            element={
              <ProtectedRoute role="owner">
                <OwnerBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner-details"
            element={
              <ProtectedRoute role="owner">
                <OwnerDetails />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
