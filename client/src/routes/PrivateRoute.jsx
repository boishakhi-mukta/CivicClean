import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (currentUser) return children;
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
