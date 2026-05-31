import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { FiSearch, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const CATEGORIES = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];

// These are the only statuses in the real workflow
const FILTER_STATUSES = ['pending', 'in-progress', 'working', 'resolved', 'rejected'];

// Keep legacy values here for display only (old DB docs may still have them)
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
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[key] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
      {value}
    </span>
  );
};

const AssignStaffModal = ({ issue, onClose, onAssign, isPending }) => {
  const [selected, setSelected] = useState('');

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['staffList'],
    queryFn: async () => (await axiosInstance.get('/users/staff')).data,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl p-7">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Assign Staff</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 truncate">
          Issue: <span className="font-medium text-gray-800 dark:text-gray-200">{issue.title}</span>
        </p>

        {isLoading ? (
          <p className="text-sm text-gray-400 mb-4">Loading staff…</p>
        ) : staffList.length === 0 ? (
          <p className="text-sm text-red-400 mb-4">No staff members exist yet.</p>
        ) : (
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="w-full px-3 py-2.5 mb-5 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#d4ff00]"
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
            className="flex-1 py-2.5 bg-[#1a3a2a] text-[#d4ff00] font-bold rounded-lg hover:bg-[#2c5f45] transition disabled:opacity-50"
          >
            {isPending ? 'Assigning…' : 'Assign'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition"
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

  const handleReject = async (issue) => {
    const { isConfirmed, value: reason } = await Swal.fire({
      title: 'Reject Issue',
      input: 'textarea',
      inputLabel: 'Reason for rejection',
      inputPlaceholder: 'Enter the reason…',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      confirmButtonColor: '#e3342f',
      inputValidator: (v) => !v && 'Please provide a reason',
    });
    if (isConfirmed && reason) rejectMutation.mutate({ id: issue._id, reason });
  };

  const issues     = data?.issues     || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6">All Issues</h1>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search title, location…"
            className="pl-9 pr-9 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#d4ff00] w-52"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); setDebouncedSearch(''); setPage(1); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <FiX size={13} />
            </button>
          )}
        </div>
        {[
          { value: statusFilter,   setter: setStatusFilter,   options: FILTER_STATUSES,              label: 'All Statuses' },
          { value: categoryFilter, setter: setCategoryFilter, options: CATEGORIES,                  label: 'All Categories' },
          { value: priorityFilter, setter: setPriorityFilter, options: ['low', 'medium', 'high'],   label: 'All Priorities' },
        ].map(({ value, setter, options, label }) => (
          <select
            key={label}
            value={value}
            onChange={e => { setter(e.target.value); resetPage(); }}
            className="px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#d4ff00]"
          >
            <option value="">{label}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition"
          >
            <FiX size={13} /> Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00]" />
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-14 text-center">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-gray-500 dark:text-gray-400">No issues match the filters.</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
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
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {issues.map((issue, idx) => (
                    <tr key={issue._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-4 text-sm text-gray-400">{(page - 1) * 10 + idx + 1}</td>
                      <td className="px-4 py-4 font-medium text-gray-900 dark:text-white max-w-[160px] truncate">
                        {issue.title}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{issue.category}</td>
                      <td className="px-4 py-4"><Badge value={issue.status}   map={STATUS_STYLES} /></td>
                      <td className="px-4 py-4"><Badge value={issue.priority} map={PRIORITY_STYLES} /></td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {issue.assignedStaff?.staffName || (
                          <span className="text-gray-400 italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {!issue.assignedStaff?.staffId && (
                            <button
                              onClick={() => issue.status?.toLowerCase() !== 'rejected' && setAssignModal(issue)}
                              disabled={issue.status?.toLowerCase() === 'rejected'}
                              title={issue.status?.toLowerCase() === 'rejected' ? 'Cannot assign a rejected issue' : 'Assign staff'}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-50 dark:disabled:hover:bg-blue-900/20"
                            >
                              Assign
                            </button>
                          )}
                          {!['rejected', 'resolved', 'closed'].includes(issue.status?.toLowerCase()) && (
                            <button
                              onClick={() => handleReject(issue)}
                              disabled={rejectMutation.isPending}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition disabled:opacity-50"
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages} · {data?.total ?? 0} total
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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
                        ? 'bg-[#1a3a2a] text-[#d4ff00]'
                        : 'border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
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
