import React from 'react';
import { Link } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 transition-colors px-4 text-center">
      <Fade direction="down" triggerOnce>
        <div className="text-9xl mb-4">🏜️</div>
        <h1 className="text-6xl font-extrabold text-[#1a3a2a] dark:text-white mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Oops! Page not found.</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          to="/"
          className="px-8 py-4 bg-[#1a3a2a] text-[#d4ff00] dark:bg-[#d4ff00] dark:text-[#1a3a2a] font-bold rounded-lg shadow-lg hover:opacity-90 transition-opacity text-lg"
        >
          Go Back Home
        </Link>
      </Fade>
    </div>
  );
};

export default NotFoundPage;
