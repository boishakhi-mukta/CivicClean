// ─────────────────────────────────────────────────────────────────────────────
// StaffRoute.jsx — Guards pages that only staff members (and admins) can see.
//
// Four outcomes:
//   1. Still checking login state → show the loading spinner.
//   2. Not logged in at all → redirect to /login.
//   3. Logged in but neither staff nor admin → redirect to the home page.
//   4. Logged in as staff OR admin → show the staff page.
//      (Admins can also access staff pages so they can check what staff sees.)
//
// Usage in App.jsx:
//   <Route path="/dashboard/staff" element={<StaffRoute><StaffDashboardLayout /></StaffRoute>} />
// ─────────────────────────────────────────────────────────────────────────────

import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const StaffRoute = ({ children }) => {
  const { currentUser, dbUser, loading } = useContext(AuthContext);
  const location = useLocation();

  // Wait for login check to finish
  if (loading) return <LoadingSpinner />;

  // Not logged in — send to login page
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;

  // Neither staff nor admin — send back to home page
  if (dbUser?.role !== 'staff' && dbUser?.role !== 'admin') return <Navigate to="/" replace />;

  // Staff or admin confirmed — show the protected content
  return children;
};

export default StaffRoute;
