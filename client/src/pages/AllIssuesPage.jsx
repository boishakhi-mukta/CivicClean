import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axiosInstance from '../api/axiosInstance';
import IssueCard, { IssueCardSkeleton } from '../components/IssueCard';
import { Fade } from 'react-awesome-reveal';

const LIMIT = 8;

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

const AllIssuesPage = () => {
  const [category, setCategory]           = useState('');
  const [status,   setStatus]             = useState('');
  const [search, setSearch]               = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage]                   = useState(1);

  useEffect(() => {
    document.title = 'CivicClean | All Issues';
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [category, status, debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: ['issues', category, status, debouncedSearch, page],
    queryFn: async () => {
      const params = { page, limit: LIMIT };
      if (category)        params.category = category;
      if (status)          params.status   = status;
      if (debouncedSearch) params.search   = debouncedSearch;
      const res = await axiosInstance.get('/issues', { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const issues     = data?.issues     ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const categories   = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];
  const pageNumbers  = getPageNumbers(page, totalPages);
  const firstItem    = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const lastItem     = Math.min(page * LIMIT, total);

  const inputClass = 'w-full px-4 py-3 rounded-lg bg-surface-alt border border-border text-text focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-focus-ring outline-none transition-all';

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">

        <div className="mb-10 text-center">
          <Fade direction="up" triggerOnce>
            <h1 className="text-4xl font-extrabold text-text mb-4">Community Issues</h1>
            <p className="text-lg text-muted">Browse, filter, and track reports in your neighborhood.</p>
          </Fade>
        </div>

        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by title, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="working">Working</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <IssueCardSkeleton key={i} />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl shadow-sm border border-border">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-2xl font-bold text-text mb-2">No Issues Found</h3>
            <p className="text-muted">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              <Fade cascade damping={0.05} triggerOnce key={`${category}-${debouncedSearch}-${page}`}>
                {issues.map(issue => (
                  <IssueCard key={issue._id} issue={issue} />
                ))}
              </Fade>
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-4">
                <p className="text-sm text-muted">
                  Showing{' '}
                  <span className="font-semibold text-text">{firstItem}–{lastItem}</span>{' '}
                  of{' '}
                  <span className="font-semibold text-text">{total}</span>{' '}
                  issues
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-text bg-surface border border-border hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <FiChevronLeft size={16} /> Prev
                  </button>

                  {pageNumbers.map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-3 py-2 text-sm text-muted select-none">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition ${
                          p === page
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'bg-surface text-text border border-border hover:bg-surface-alt'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-text bg-surface border border-border hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next <FiChevronRight size={16} />
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
