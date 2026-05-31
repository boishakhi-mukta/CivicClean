import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axiosInstance from '../api/axiosInstance';
import IssueCard from '../components/IssueCard';
import { Fade } from 'react-awesome-reveal';

const LIMIT = 6;

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

const AllIssuesPage = () => {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = "CivicClean | All Issues";
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [category, debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: ['issues', category, debouncedSearch, page],
    queryFn: async () => {
      const params = { page, limit: LIMIT };
      if (category) params.category = category;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await axiosInstance.get('/issues', { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const issues     = data?.issues     ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const categories = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];
  const pageNumbers = getPageNumbers(page, totalPages);

  const firstItem = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const lastItem  = Math.min(page * LIMIT, total);

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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Fade cascade damping={0.05} triggerOnce key={`${category}-${debouncedSearch}-${page}`}>
                {issues.map(issue => (
                  <IssueCard key={issue._id} issue={issue} />
                ))}
              </Fade>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-semibold text-gray-700 dark:text-gray-200">{firstItem}–{lastItem}</span> of <span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span> issues
                </p>
                <div className="flex items-center gap-1">

                  {/* Prev */}
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <FiChevronLeft size={16} />
                    Prev
                  </button>

                  {/* Page numbers */}
                  {pageNumbers.map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500 select-none">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition
                          ${p === page
                            ? 'bg-[#1a3a2a] text-[#d4ff00] dark:bg-[#d4ff00] dark:text-[#1a3a2a] shadow-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next
                    <FiChevronRight size={16} />
                  </button>

                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllIssuesPage;
