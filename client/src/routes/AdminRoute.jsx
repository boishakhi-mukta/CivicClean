// ─────────────────────────────────────────────────────────────────────────────
// AdminRoute.jsx — Guards pages that only admins are allowed to see.
//
// Four outcomes:
//   1. Still checking login state → show the loading spinner.
//   2. Not logged in at all → redirect to /login (remember the intended page).
//   3. Logged in but NOT an admin → redirect to the home page (access denied).
//   4. Logged in AND is an admin → show the admin page.
//
// Usage in App.jsx:
//   <Route path="/dashboard/admin" element={<AdminRoute><AdminDashboardLayout /></AdminRoute>} />
// ─────────────────────────────────────────────────────────────────────────────

import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminRoute = ({ children }) => {
  const { currentUser, dbUser, loading } = useContext(AuthContext);
  const location = useLocation();

  // Wait for login state + role to be confirmed before rendering anything
  if (loading) return <LoadingSpinner />;

  // Not logged in — send to login page
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;

  // Logged in but not an admin — send back to home page
  if (dbUser?.role !== 'admin') return <Navigate to="/" replace />;

  // Admin confirmed — show the protected content
  return children;
};

export default AdminRoute;
