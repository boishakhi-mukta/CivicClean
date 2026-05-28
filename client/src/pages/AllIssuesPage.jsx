import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import IssueCard from '../components/IssueCard';
import { Fade } from 'react-awesome-reveal';

const AllIssuesPage = () => {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    document.title = "CivicClean | All Issues";
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues', category, debouncedSearch],
    queryFn: async () => {
      const params = {};
      if (category) params.category = category;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await axiosInstance.get('/issues', { params });
      return res.data.issues;
    },
  });

  const categories = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">

        <div className="mb-10 text-center">
          <Fade direction="up" triggerOnce>
            <h1 className="text-4xl font-extrabold text-[#1a3a2a] dark:text-white mb-4">Community Issues</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Browse, filter, and track reports in your neighborhood.</p>
          </Fade>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by title, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none transition-all dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Issues Grid */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00]"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Issues Found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Fade cascade damping={0.05} triggerOnce>
              {issues.map(issue => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </Fade>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllIssuesPage;
