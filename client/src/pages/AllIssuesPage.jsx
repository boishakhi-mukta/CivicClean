import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { FiChevronLeft, FiChevronRight, FiSearch, FiFilter, FiX, FiSliders, FiChevronDown, FiCheck } from 'react-icons/fi';
import axiosInstance from '../api/axiosInstance';
import IssueCard, { IssueCardSkeleton } from '../components/IssueCard';
import { Fade } from 'react-awesome-reveal';

const LIMIT = 8;

const CATEGORIES = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];
const STATUSES   = ['pending', 'in-progress', 'working', 'resolved', 'closed', 'rejected'];

const STATUS_LABELS = {
  'pending':     'Pending',
  'in-progress': 'In Progress',
  'working':     'Working',
  'resolved':    'Resolved',
  'closed':      'Closed',
  'rejected':    'Rejected',
};

const STATUS_DOTS = {
  'pending':     'bg-yellow-400',
  'in-progress': 'bg-blue-400',
  'working':     'bg-violet-400',
  'resolved':    'bg-green-500',
  'closed':      'bg-gray-400',
  'rejected':    'bg-red-400',
};

/* ── Compact dropdown — used for tablet inline bar + desktop status ── */
const CompactDropdown = ({ label, value, options, labels = {}, dots = {}, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = !!value;
  const displayLabel = value ? (labels[value] || value) : `All ${label}s`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition whitespace-nowrap
          ${isActive
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border bg-surface text-text hover:border-primary/40 hover:bg-surface-alt'
          }`}
      >
        <span className="truncate max-w-[150px]">{displayLabel}</span>
        <FiChevronDown size={14} className={`flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 min-w-full bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1">
          <button
            onClick={() => { onChange(''); setOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition
              ${!value ? 'bg-primary/8 text-primary font-semibold' : 'text-text hover:bg-surface-alt'}`}
          >
            {!value ? <FiCheck size={13} className="flex-shrink-0" /> : <span className="w-3.5 flex-shrink-0" />}
            All {label}s
          </button>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition
                ${value === opt ? 'bg-primary/8 text-primary font-semibold' : 'text-text hover:bg-surface-alt'}`}
            >
              {value === opt
                ? <FiCheck size={13} className="flex-shrink-0" />
                : <span className="w-3.5 flex-shrink-0" />
              }
              {dots[opt] && (
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${value === opt ? 'bg-primary/60' : dots[opt]}`} />
              )}
              <span className="capitalize">{labels[opt] || opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

/* ── Filter panel — used in desktop sidebar (statusDropdown=true) and mobile drawer ── */
const FilterPanel = ({ search, setSearch, category, setCategory, status, setStatus, statusDropdown = false }) => (
  <div className="space-y-8">
    {/* Search */}
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Search</p>
      <div className="relative">
        <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Title, location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-focus-ring transition"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text">
            <FiX size={13} />
          </button>
        )}
      </div>
    </div>

    {/* Category */}
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Category</p>
      <div className="space-y-1.5">
        <button
          onClick={() => setCategory('')}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${!category ? 'bg-primary text-on-primary font-semibold' : 'text-text hover:bg-surface-alt'}`}
        >
          All Categories
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${category === c ? 'bg-primary text-on-primary font-semibold' : 'text-text hover:bg-surface-alt'}`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>

    {/* Status — dropdown on desktop sidebar, vertical list in mobile drawer */}
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Status</p>
      {statusDropdown ? (
        <CompactDropdown
          label="Status"
          value={status}
          options={STATUSES}
          labels={STATUS_LABELS}
          dots={STATUS_DOTS}
          onChange={setStatus}
        />
      ) : (
        <div className="space-y-1.5">
          <button
            onClick={() => setStatus('')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${!status ? 'bg-primary text-on-primary font-semibold' : 'text-text hover:bg-surface-alt'}`}
          >
            All Statuses
          </button>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${status === s ? 'bg-primary text-on-primary font-semibold' : 'text-text hover:bg-surface-alt'}`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status === s ? 'bg-on-primary' : STATUS_DOTS[s]}`} />
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>

    {/* Reset */}
    {(category || status || search) && (
      <button
        onClick={() => { setCategory(''); setStatus(''); setSearch(''); }}
        className="w-full py-2 text-sm text-danger border border-danger/30 rounded-lg hover:bg-danger/5 transition font-medium"
      >
        Clear All Filters
      </button>
    )}
  </div>
);

const AllIssuesPage = () => {
  const [category, setCategory]           = useState('');
  const [status,   setStatus]             = useState('');
  const [search, setSearch]               = useState('');
  const [page, setPage]                   = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    document.title = 'CivicClean | Explore Issues';
  }, []);

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
  const pageNumbers = getPageNumbers(page, totalPages);
  const firstItem   = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const lastItem    = Math.min(page * LIMIT, total);

  const activeFilters = [
    category && { label: category,            clear: () => setCategory('') },
    status   && { label: STATUS_LABELS[status], clear: () => setStatus('') },
  ].filter(Boolean);

  const filterProps = { search, setSearch, category, setCategory, status, setStatus };

  return (
    <div className="min-h-screen bg-bg transition-colors duration-200">

      {/* Page header */}
      <div className="relative bg-primary overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-on-primary/5 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-on-primary/5 pointer-events-none" />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <Fade direction="up" triggerOnce>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-on-primary tracking-tight mb-4">
              Explore Issues
            </h1>
            <p className="text-on-primary/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Browse and filter community reports from your neighborhood.
            </p>
          </Fade>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">

          {/* ── Left Sidebar (desktop) ── */}
          <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 sticky top-24">
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 pb-5 border-b border-border">
                <FiSliders size={16} className="text-primary" />
                <span className="font-bold text-text text-sm">Filters</span>
                {activeFilters.length > 0 && (
                  <span className="ml-auto text-xs font-bold bg-primary text-on-primary px-2 py-0.5 rounded-full">
                    {activeFilters.length}
                  </span>
                )}
              </div>
              <FilterPanel {...filterProps} statusDropdown />
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">

            {/* ── Small mobile only (< sm): search + Filters drawer button ── */}
            <div className="sm:hidden flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search issues…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                    <FiX size={13} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition ${activeFilters.length > 0 ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface text-text'}`}
              >
                <FiFilter size={14} />
                Filters
                {activeFilters.length > 0 && (
                  <span className="w-5 h-5 text-xs flex items-center justify-center bg-primary text-on-primary rounded-full font-bold">
                    {activeFilters.length}
                  </span>
                )}
              </button>
            </div>

            {/* ── Tablet (sm → lg): inline search + category + status dropdowns ── */}
            <div className="hidden sm:flex lg:hidden flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 min-w-[160px]">
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search issues…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                    <FiX size={13} />
                  </button>
                )}
              </div>
              <CompactDropdown
                label="Category"
                value={category}
                options={CATEGORIES}
                onChange={setCategory}
              />
              <CompactDropdown
                label="Status"
                value={status}
                options={STATUSES}
                labels={STATUS_LABELS}
                dots={STATUS_DOTS}
                onChange={setStatus}
              />
              {(category || status || search) && (
                <button
                  onClick={() => { setCategory(''); setStatus(''); setSearch(''); }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-danger/30 text-danger text-sm font-semibold hover:bg-danger/5 transition"
                >
                  <FiX size={13} /> Clear
                </button>
              )}
            </div>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {activeFilters.map(f => (
                  <span key={f.label} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                    {f.label}
                    <button onClick={f.clear} className="hover:opacity-70 transition">
                      <FiX size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Results count */}
            <p className="text-sm text-muted mb-6">
              {isLoading ? 'Loading…' : (
                <>
                  <span className="font-semibold text-text">{total.toLocaleString()}</span>{' '}
                  issue{total !== 1 ? 's' : ''} found
                </>
              )}
            </p>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {Array.from({ length: LIMIT }).map((_, i) => (
                  <IssueCardSkeleton key={i} />
                ))}
              </div>
            ) : issues.length === 0 ? (
              <div className="text-center py-24 bg-surface rounded-2xl border border-border">
                <span className="text-6xl mb-4 block">🔍</span>
                <h3 className="text-xl font-bold text-text mb-2">No Issues Found</h3>
                <p className="text-muted text-sm">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
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
                    <div className="flex items-center gap-1 flex-wrap justify-center">
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
      </div>

      {/* Mobile filter drawer — small screens only */}
      {mobileFiltersOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto w-80 max-w-[90vw] h-full bg-surface shadow-2xl overflow-y-auto p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FiSliders size={16} className="text-primary" />
                <span className="font-bold text-text">Filters</span>
              </div>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-muted hover:text-text p-1">
                <FiX size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterPanel {...filterProps} />
            </div>
            <div className="pt-4 flex-shrink-0">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-primary text-on-primary rounded-xl font-semibold text-sm"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllIssuesPage;
