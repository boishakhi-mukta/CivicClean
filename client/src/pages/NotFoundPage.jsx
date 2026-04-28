import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  useEffect(() => {
    document.title = "CivicClean | 404 Not Found";
  }, []);

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-2xl mt-4 text-gray-600">Page Not Found</p>
      <Link to="/" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
