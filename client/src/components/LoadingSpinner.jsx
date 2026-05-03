import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00] animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="text-xl">🌿</span>
        </div>
      </div>
      <p className="mt-6 text-gray-500 dark:text-gray-400 font-semibold tracking-wide animate-pulse">Loading CivicClean...</p>
    </div>
  );
};

export default LoadingSpinner;
