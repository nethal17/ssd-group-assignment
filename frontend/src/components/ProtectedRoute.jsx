import React from "react";
import { Navigate } from "react-router-dom";

// UX guard only - it just hides the route in the browser. Anyone can edit
// localStorage or call the API directly, so the real check is server-side (V6:
// authMiddleware + authorizeRoles on the matching /api routes).
export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let role;
  try {
    role = JSON.parse(localStorage.getItem("user") || "{}")?.role;
  } catch {
    // corrupted user blob - treat as logged out rather than letting it through
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
