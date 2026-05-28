import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const StaffRoute = ({ children }) => {
  const { currentUser, dbUser, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  if (dbUser?.role !== 'staff' && dbUser?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default StaffRoute;
