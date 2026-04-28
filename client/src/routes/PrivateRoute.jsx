import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    // Return a spinner or loading indicator while Auth state is resolving
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (currentUser) {
    return children;
  }

  // Redirect to the login page (or auth page) and preserve the intended destination
  return <Navigate to="/auth" state={{ from: location }} replace />;
};

export default PrivateRoute;
