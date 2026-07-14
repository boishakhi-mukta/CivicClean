// ─────────────────────────────────────────────────────────────────────────────
// MapPage.jsx — An interactive map at /map showing all reported issues as pins.
//
// Uses Leaflet (an open-source mapping library) to render an OpenStreetMap base
// map centred on Oslo, Norway ([59.9139, 10.7522]).
//
// The marker icon fix at the top (delete L.Icon.Default.prototype._getIconUrl)
// is a known workaround for a Leaflet + Webpack compatibility issue where the
// default marker images fail to load — this forces Leaflet to use the correct
// bundled image paths.
//
// How issues appear on the map:
//   Each issue with lat/lng coordinates becomes a pin. If an issue has no
//   coordinates stored (most legacy issues are text-only locations like
//   "Main Street"), the pin is placed at a random offset from Oslo's centre
//   so the map still shows something meaningful.
//   Clicking a pin opens a popup with the issue title, category, status badge,
//   and a "View Details →" link to the full issue page.
//
// Left sidebar:
//   • FilterDropdown components for Category and Status.
//   • A "Breakdown" panel showing each category with a count and progress bar.
//     Clicking a category bar filters the map to that category only.
//
// Mobile: the sidebar is hidden; two inline compact dropdowns appear above the
// map instead.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiCheck, FiX, FiFilter } from 'react-icons/fi';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

const DEFAULT_CENTER = [59.9139, 10.7522];

const CATEGORIES = ['All', 'Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];
const STATUSES   = ['All', 'pending', 'in-progress', 'working', 'resolved', 'closed', 'rejected'];

const STATUS_STYLES = {
  pending:       'bg-amber-100  text-amber-700',
  'in-progress': 'bg-blue-100   text-blue-700',
  working:       'bg-purple-100 text-purple-700',
  resolved:      'bg-emerald-100 text-emerald-700',
  closed:        'bg-gray-100   text-gray-600',
  rejected:      'bg-red-100    text-red-700',
};

const STATUS_DOT = {
  pending:       'bg-amber-400',
  'in-progress': 'bg-blue-400',
  working:       'bg-purple-400',
  resolved:      'bg-emerald-400',
  closed:        'bg-gray-400',
  rejected:      'bg-red-400',
};

/* ── Dropdown component used inside the sidebar ── */
const FilterDropdown = ({ label, value, options, onChange, counts }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = value !== 'All';

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
          isActive
            ? 'border-primary bg-primary/8 text-primary'
            : 'border-border bg-surface text-text hover:border-primary/40 hover:bg-surface-alt'
        }`}
      >
        <span className="flex-1 text-left text-sm">
          {value === 'All' ? `All ${label}s` : value}
        </span>
        <FiChevronDown
          size={14}
          className={`flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isActive ? 'text-primary' : 'text-muted'}`}
        />
      </button>

      {/* Dropdown panel — z-50 so it floats above map */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="px-3.5 py-2 border-b border-border">
            <p className="text-xs font-bold text-muted uppercase tracking-wider">{label}</p>
          </div>
          <div className="py-1 max-h-52 overflow-y-auto">
            {options.map(opt => {
              const selected = value === opt;
              const count    = counts?.[opt] ?? null;
              return (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors ${
                    selected ? 'bg-primary/8 text-primary' : 'text-text hover:bg-surface-alt'
                  }`}
                >
                  {STATUS_DOT[opt] && (
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[opt]}`} />
                  )}
                  <span className="flex-1 text-left capitalize">
                    {opt === 'All' ? `All ${label}s` : opt}
                  </span>
                  {count !== null && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${selected ? 'bg-primary/20 text-primary' : 'bg-surface-alt text-muted'}`}>
                      {count}
                    </span>
                  )}
                  {selected && <FiCheck size={13} className="flex-shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Main page ── */
const MapPage = () => {
  useEffect(() => { document.title = 'CivicClean | Issue Map'; }, []);

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter,   setStatusFilter]   = useState('All');

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['mapIssues'],
    queryFn: async () => (await axiosInstance.get('/issues?limit=1000')).data.issues,
  });

  const filtered = issues.filter(i => {
    if (categoryFilter !== 'All' && i.category !== categoryFilter) return false;
    if (statusFilter   !== 'All' && i.status   !== statusFilter)   return false;
    return true;
  });

  const hasActiveFilter = categoryFilter !== 'All' || statusFilter !== 'All';

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'All' ? issues.length : issues.filter(i => i.category === cat).length;
    return acc;
  }, {});
  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = s === 'All' ? issues.length : issues.filter(i => i.status === s).length;
    return acc;
  }, {});

  const clearFilters = () => { setCategoryFilter('All'); setStatusFilter('All'); };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        {/* Skeleton hero */}
        <div className="bg-primary py-14">
          <div className="max-w-5xl mx-auto px-4 text-center animate-pulse">
            <div className="h-10 w-72 bg-on-primary/20 rounded-xl mx-auto mb-4" />
            <div className="h-5 w-80 max-w-full bg-on-primary/20 rounded-lg mx-auto" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="flex gap-6">
            <div className="w-60 flex-shrink-0 space-y-3">
              <div className="h-10 bg-surface-alt rounded-xl border border-border" />
              <div className="h-10 bg-surface-alt rounded-xl border border-border" />
              <div className="h-32 bg-surface-alt rounded-xl border border-border" />
            </div>
            <div className="flex-1 h-[560px] bg-surface-alt rounded-2xl border border-border" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg transition-colors duration-200">

      {/* ── Hero ── */}
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

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-on-primary tracking-tight mb-4">
            Interactive Issue Map
          </h1>
          <p className="text-on-primary/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Explore every civic issue reported in your community — updated in real time.
          </p>
        </div>
      </div>

      {/* ── Body: sidebar + map ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 items-start">

          {/* ══ LEFT SIDEBAR ══ */}
          <aside className="hidden md:flex flex-col gap-4 w-56 xl:w-64 flex-shrink-0">

            {/* Filter panel */}
            <div className="bg-surface rounded-2xl border border-border shadow-md">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-alt/60 rounded-t-2xl">
                <FiFilter size={13} className="text-primary" />
                <h3 className="text-xs font-bold text-text uppercase tracking-wider">Filters</h3>
                {hasActiveFilter && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto flex items-center gap-1 text-xs font-semibold text-muted hover:text-danger transition"
                  >
                    <FiX size={11} />
                    Clear
                  </button>
                )}
              </div>

              <div className="p-3 space-y-3">
                {/* Category dropdown */}
                <div>
                  <p className="text-xs font-semibold text-muted mb-1.5 px-0.5">Category</p>
                  <FilterDropdown
                    label="Category"
                    value={categoryFilter}
                    options={CATEGORIES}
                    onChange={setCategoryFilter}
                    counts={categoryCounts}
                  />
                </div>

                {/* Status dropdown */}
                <div>
                  <p className="text-xs font-semibold text-muted mb-1.5 px-0.5">Status</p>
                  <FilterDropdown
                    label="Status"
                    value={statusFilter}
                    options={STATUSES}
                    onChange={setStatusFilter}
                    counts={statusCounts}
                  />
                </div>
              </div>

              {/* Result count */}
              <div className="px-4 py-2.5 border-t border-border bg-surface-alt/40 rounded-b-2xl">
                {hasActiveFilter ? (
                  <p className="text-xs font-bold text-primary">
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
                  </p>
                ) : (
                  <p className="text-xs text-muted">
                    {issues.length} issue{issues.length !== 1 ? 's' : ''} total
                  </p>
                )}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-surface rounded-2xl border border-border shadow-md overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-surface-alt/60">
                <h3 className="text-xs font-bold text-text uppercase tracking-wider">Breakdown</h3>
              </div>
              <div className="p-3 space-y-2">
                {CATEGORIES.filter(c => c !== 'All').map(cat => {
                  const count    = issues.filter(i => i.category === cat).length;
                  const pct      = issues.length ? Math.round((count / issues.length) * 100) : 0;
                  const isActive = categoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(isActive ? 'All' : cat)}
                      className={`w-full text-left rounded-xl px-3 py-2.5 transition-all ${
                        isActive
                          ? 'bg-primary/8 border border-primary/20'
                          : 'hover:bg-surface-alt border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-semibold leading-snug truncate pr-2 ${isActive ? 'text-primary' : 'text-text'}`}>
                          {cat}
                        </span>
                        <span className={`text-xs font-bold flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted'}`}>
                          {count}
                        </span>
                      </div>
                      <div className="h-1 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isActive ? 'bg-primary' : 'bg-primary/40'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </aside>

          {/* ══ MAP ══ */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Mobile filter strip */}
            <div className="flex md:hidden items-center gap-2 flex-wrap">
              <FilterDropdown
                label="Category"
                value={categoryFilter}
                options={CATEGORIES}
                onChange={setCategoryFilter}
                counts={categoryCounts}
              />
              <FilterDropdown
                label="Status"
                value={statusFilter}
                options={STATUSES}
                onChange={setStatusFilter}
                counts={statusCounts}
              />
              {hasActiveFilter && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-danger bg-danger/8 border border-danger/20 hover:bg-danger/15 transition"
                >
                  <FiX size={12} /> Clear
                </button>
              )}
            </div>

            {/* Map container */}
            <div className="h-[480px] sm:h-[560px] lg:h-[640px] w-full rounded-2xl overflow-hidden shadow-2xl border border-border relative z-0">
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filtered.map((issue, i) => {
                  const lat = issue.location?.lat || (DEFAULT_CENTER[0] + (Math.random() - 0.5) * 0.1);
                  const lng = issue.location?.lng || (DEFAULT_CENTER[1] + (Math.random() - 0.5) * 0.1);
                  return (
                    <Marker position={[lat, lng]} key={issue._id || i}>
                      <Popup>
                        <div className="p-1 min-w-[160px]">
                          <h3 className="font-bold text-sm mb-1 leading-snug">{issue.title}</h3>
                          <p className="text-xs text-muted mb-1">{issue.category}</p>
                          {issue.status && (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize mb-2 ${STATUS_STYLES[issue.status] || 'bg-gray-100 text-gray-600'}`}>
                              {issue.status}
                            </span>
                          )}
                          <br />
                          <Link
                            to={`/explore/${issue._id}`}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            View Details →
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
