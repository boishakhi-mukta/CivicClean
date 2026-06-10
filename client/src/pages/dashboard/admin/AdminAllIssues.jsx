import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiSearch, FiX, FiChevronLeft, FiChevronRight, FiEye, FiMapPin, FiCalendar, FiUser, FiTag, FiAlertCircle } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const CATEGORIES = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];

const FILTER_STATUSES = ['pending', 'in-progress', 'working', 'resolved', 'rejected'];

const STATUS_STYLES = {
  pending:       'bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300',
  open:          'bg-sky-100    text-sky-800    dark:bg-sky-900/40    dark:text-sky-300',
  'in-progress': 'bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300',
  'in progress': 'bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300',
  working:       'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  ongoing:       'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  resolved:      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  closed:        'bg-gray-100   text-gray-700   dark:bg-gray-700      dark:text-gray-300',
  ended:         'bg-gray-100   text-gray-700   dark:bg-gray-700      dark:text-gray-300',
  rejected:      'bg-red-100    text-red-800    dark:bg-red-900/40    dark:text-red-300',
};

const PRIORITY_STYLES = {
  low:    'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  high:   'bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-300',
};

const Badge = ({ value, map }) => {
  if (!value) return null;
  const key = value.toLowerCase();
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[key] || 'bg-surface-alt text-muted'}`}>
      {value}
    </span>
  );
};

const ViewIssueModal = ({ issue, onClose }) => {
  const [imgExpanded, setImgExpanded] = useState(false);
  if (!issue) return null;

  const statusStyle   = STATUS_STYLES[issue.status?.toLowerCase()]   || 'bg-surface-alt text-muted';
  const priorityStyle = PRIORITY_STYLES[issue.priority?.toLowerCase()] || '';
  const reportedDate  = issue.date ? new Date(issue.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const meta = [
    { icon: FiTag,      label: 'Category',    value: issue.category },
    { icon: FiMapPin,   label: 'Location',    value: issue.location },
    { icon: FiUser,     label: 'Reported by', value: issue.email },
    { icon: FiUser,     label: 'Assigned to', value: issue.assignedStaff?.staffName },
    { icon: FiUser,     label: 'Staff email',  value: issue.assignedStaff?.staffEmail },
    { icon: FiCalendar, label: 'Reported on', value: reportedDate },
  ].filter(r => r.value);

  return (
    <>
      {/* Main modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4">
        <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col">

          {/* Header */}
          <div className="flex justify-between items-start px-6 py-5 border-b border-border flex-shrink-0">
            <div className="flex-1 pr-4">
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Issue Report</p>
              <h3 className="text-xl font-extrabold text-text leading-snug">{issue.title}</h3>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {issue.status && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyle}`}>
                    {issue.status}
                  </span>
                )}
                {issue.priority && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${priorityStyle}`}>
                    {issue.priority} priority
                  </span>
                )}
                {issue.isBoosted && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Boosted
                  </span>
                )}
                {issue.upvoteCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-alt text-muted">
                    ▲ {issue.upvoteCount} upvotes
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-alt transition flex-shrink-0">
              <FiX size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 divide-y divide-border">

            {/* Image */}
            {issue.image && (
              <div className="p-4">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Photo</p>
                <div
                  className="relative overflow-hidden rounded-xl border border-border bg-surface-alt cursor-zoom-in group"
                  onClick={() => setImgExpanded(true)}
                >
                  <img
                    src={issue.image}
                    alt="Issue photo"
                    loading="lazy"
                    className="w-full max-h-72 object-cover transition duration-200 group-hover:brightness-95"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                      Click to expand
                    </span>
                  </div>
                </div>
              </div>
            )}

            {!issue.image && (
              <div className="p-4">
                <div className="w-full h-24 rounded-xl border border-dashed border-border bg-surface-alt flex items-center justify-center">
                  <p className="text-sm text-muted">No photo attached</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="p-6">
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Description</p>
              {issue.description ? (
                <p className="text-sm text-text leading-relaxed">{issue.description}</p>
              ) : (
                <p className="text-sm text-muted italic">No description provided.</p>
              )}
            </div>

            {/* Meta details */}
            <div className="p-6">
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {meta.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-surface-alt rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted font-medium">{label}</p>
                      <p className="text-sm text-text font-semibold truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rejection reason */}
            {issue.rejectedReason && (
              <div className="p-6">
                <div className="flex items-start gap-3 p-4 bg-danger/5 border border-danger/20 rounded-xl">
                  <FiAlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-danger uppercase tracking-wider mb-1">Rejection Reason</p>
                    <p className="text-sm text-text">{issue.rejectedReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            {issue.timeline?.length > 0 && (
              <div className="p-6">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Activity Timeline</p>
                <div className="space-y-3">
                  {[...issue.timeline].reverse().map((entry, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        {i < issue.timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-3 flex-1 min-w-0">
                        <p className="text-sm text-text leading-snug">{entry.message}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {entry.updatedBy} · {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-surface-alt text-text font-semibold rounded-xl hover:bg-border/40 transition text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen image lightbox */}
      {imgExpanded && issue.image && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setImgExpanded(false)}
        >
          <img
            src={issue.image}
            alt="Issue photo full"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
          <button
            onClick={() => setImgExpanded(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <FiX size={20} />
          </button>
        </div>
      )}
    </>
  );
};

const AssignStaffModal = ({ issue, onClose, onAssign, isPending }) => {
  const [selected, setSelected] = useState('');

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['staffList'],
    queryFn: async () => (await axiosInstance.get('/users/staff')).data,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl p-7">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-text">Assign Staff</h3>
          <button onClick={onClose} className="text-muted hover:text-text">
            <FiX size={20} />
          </button>
        </div>
        <p className="text-sm text-muted mb-4 truncate">
          Issue: <span className="font-medium text-text">{issue.title}</span>
        </p>

        {isLoading ? (
          <p className="text-sm text-muted mb-4">Loading staff…</p>
        ) : staffList.length === 0 ? (
          <p className="text-sm text-danger mb-4">No staff members exist yet.</p>
        ) : (
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="w-full px-3 py-2.5 mb-5 rounded-lg border border-border bg-surface-alt text-text outline-none focus:ring-2 focus:ring-focus-ring"
          >
            <option value="">Select a staff member</option>
            {staffList.map(s => (
              <option
                key={s._id}
                value={JSON.stringify({ staffId: s._id, staffName: s.name, staffEmail: s.email })}
              >
                {s.name} — {s.email}
              </option>
            ))}
          </select>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (!selected) return toast.error('Please select a staff member');
              onAssign(JSON.parse(selected));
            }}
            disabled={isPending || isLoading}
            className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-hover transition disabled:opacity-50"
          >
            {isPending ? 'Assigning…' : 'Assign'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-surface-alt text-text font-medium rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminAllIssues = () => {
  const queryClient = useQueryClient();

  const [page,            setPage]            = useState(1);
  const [statusFilter,    setStatusFilter]    = useState('');
  const [categoryFilter,  setCategoryFilter]  = useState('');
  const [priorityFilter,  setPriorityFilter]  = useState('');
  const [searchInput,     setSearchInput]     = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [assignModal,     setAssignModal]     = useState(null);
  const [viewModal,       setViewModal]       = useState(null);

  const hasActiveFilters = statusFilter || categoryFilter || priorityFilter || searchInput;

  const clearFilters = () => {
    setStatusFilter('');
    setCategoryFilter('');
    setPriorityFilter('');
    setSearchInput('');
    setDebouncedSearch('');
    setPage(1);
  };

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const resetPage = useCallback(() => setPage(1), []);

  const { data, isLoading } = useQuery({
    queryKey: ['adminIssues', page, statusFilter, categoryFilter, priorityFilter, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter)    params.set('status',   statusFilter);
      if (categoryFilter)  params.set('category', categoryFilter);
      if (priorityFilter)  params.set('priority', priorityFilter);
      if (debouncedSearch) params.set('search',   debouncedSearch);
      return (await axiosInstance.get(`/issues?${params}`)).data;
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ issueId, staffData }) =>
      axiosInstance.patch(`/issues/${issueId}/assign`, staffData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminIssues'] });
      toast.success('Staff assigned!');
      setAssignModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Assignment failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => axiosInstance.patch(`/issues/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminIssues'] });
      toast.success('Issue rejected');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Rejection failed'),
  });

  const handleReject = (issue) => {
    const reason = window.prompt('Reason for rejection:');
    if (reason === null) return;
    if (!reason.trim()) { toast.error('Please provide a reason'); return; }
    rejectMutation.mutate({ id: issue._id, reason: reason.trim() });
  };

  const issues     = data?.issues     || [];
  const totalPages = data?.totalPages || 1;

  const filterClass = 'px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm outline-none focus:ring-2 focus:ring-focus-ring';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-text">All Issues</h1>
        <p className="text-sm text-muted mt-0.5">Review, assign, and manage community reports</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search title, location…"
            className={`${filterClass} pl-9 pr-9 w-52`}
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); setDebouncedSearch(''); setPage(1); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-text"
            >
              <FiX size={13} />
            </button>
          )}
        </div>
        {[
          { value: statusFilter,   setter: setStatusFilter,   options: FILTER_STATUSES,            label: 'All Statuses' },
          { value: categoryFilter, setter: setCategoryFilter, options: CATEGORIES,                  label: 'All Categories' },
          { value: priorityFilter, setter: setPriorityFilter, options: ['low', 'medium', 'high'],   label: 'All Priorities' },
        ].map(({ value, setter, options, label }) => (
          <select
            key={label}
            value={value}
            onChange={e => { setter(e.target.value); resetPage(); }}
            className={filterClass}
          >
            <option value="">{label}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-danger/30 bg-danger/5 text-danger text-sm font-medium hover:bg-danger/10 transition"
          >
            <FiX size={13} /> Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-alt/50 border-b border-border">
                <tr>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <th key={i} className="px-4 py-4">
                      <div className="h-3 w-16 bg-surface-alt rounded" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4"><div className="h-4 w-5 bg-surface-alt rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-36 bg-surface-alt rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-surface-alt rounded" /></td>
                    <td className="px-4 py-4"><div className="h-5 w-18 bg-surface-alt rounded-full" /></td>
                    <td className="px-4 py-4"><div className="h-5 w-14 bg-surface-alt rounded-full" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-surface-alt rounded" /></td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <div className="h-7 w-7 bg-surface-alt rounded-lg" />
                        <div className="h-7 w-7 bg-surface-alt rounded-lg" />
                        <div className="h-7 w-7 bg-surface-alt rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-14 text-center">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-muted">No issues match the filters.</p>
        </div>
      ) : (
        <>
          <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-surface-alt/50 border-b border-border text-xs uppercase tracking-wider text-muted font-semibold">
                  <tr>
                    <th className="px-4 py-4">#</th>
                    <th className="px-4 py-4">Title</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Priority</th>
                    <th className="px-4 py-4">Assigned Staff</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {issues.map((issue, idx) => (
                    <tr key={issue._id} className="hover:bg-surface-alt/60 transition-colors">
                      <td className="px-4 py-4 text-sm text-muted">{(page - 1) * 10 + idx + 1}</td>
                      <td className="px-4 py-4 font-medium text-text max-w-[160px] truncate">
                        {issue.title}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted">{issue.category}</td>
                      <td className="px-4 py-4"><Badge value={issue.status}   map={STATUS_STYLES} /></td>
                      <td className="px-4 py-4"><Badge value={issue.priority} map={PRIORITY_STYLES} /></td>
                      <td className="px-4 py-4 text-sm text-muted">
                        {issue.assignedStaff?.staffName || (
                          <span className="text-muted italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setViewModal(issue)}
                            title="View details"
                            className="p-1.5 rounded-lg text-muted bg-surface-alt hover:bg-border/40 hover:text-text transition"
                          >
                            <FiEye size={14} />
                          </button>
                          {!issue.assignedStaff?.staffId && (
                            <button
                              onClick={() => issue.status?.toLowerCase() !== 'rejected' && setAssignModal(issue)}
                              disabled={issue.status?.toLowerCase() === 'rejected'}
                              title={issue.status?.toLowerCase() === 'rejected' ? 'Cannot assign a rejected issue' : 'Assign staff'}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition bg-info/10 text-info hover:bg-info/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-info/10"
                            >
                              Assign
                            </button>
                          )}
                          {!['rejected', 'resolved', 'closed'].includes(issue.status?.toLowerCase()) && (
                            <button
                              onClick={() => handleReject(issue)}
                              disabled={rejectMutation.isPending}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-danger/10 text-danger hover:bg-danger/20 transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
            <p className="text-sm text-muted">
              Page {page} of {totalPages} · {data?.total ?? 0} total
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-surface-alt transition"
              >
                <FiChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                      p === page
                        ? 'bg-primary text-on-primary'
                        : 'border border-border text-text hover:bg-surface-alt'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-surface-alt transition"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {viewModal && (
        <ViewIssueModal issue={viewModal} onClose={() => setViewModal(null)} />
      )}

      {assignModal && (
        <AssignStaffModal
          issue={assignModal}
          onClose={() => setAssignModal(null)}
          onAssign={(staffData) => assignMutation.mutate({ issueId: assignModal._id, staffData })}
          isPending={assignMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminAllIssues;
