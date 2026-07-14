// ─────────────────────────────────────────────────────────────────────────────
// PrivateRoute.jsx — Guards pages that require the user to be logged in.
//
// Three outcomes:
//   1. Still checking login state → show the loading spinner (don't flash the page).
//   2. User is logged in → show the requested page normally.
//   3. User is NOT logged in → redirect to /login.
//      The current URL is remembered so after login the user is sent back
//      to the page they were trying to reach.
//
// Usage in App.jsx:
//   <Route path="/dashboard/citizen" element={<PrivateRoute><CitizenDashboardLayout /></PrivateRoute>} />
// ─────────────────────────────────────────────────────────────────────────────

import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  const location = useLocation();

  // Wait for Firebase to finish checking the session before deciding anything
  if (loading) return <LoadingSpinner />;

  // Logged in — show the protected page
  if (currentUser) return children;

  // Not logged in — redirect to login, remembering where the user wanted to go
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
