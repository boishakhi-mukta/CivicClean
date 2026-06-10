import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiExternalLink, FiArrowRight, FiX } from 'react-icons/fi';
import { AuthContext } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosInstance';

const NEXT_STATUS = {
  'pending':     'in-progress',
  'in-progress': 'working',
  'working':     'resolved',
};

const FILTER_STATUSES = ['pending', 'in-progress', 'working', 'rejected'];

const STATUS_STYLES = {
  pending:       'bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-400',
  'in-progress': 'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-400',
  working:       'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  resolved:      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  closed:        'bg-gray-100   text-gray-700   dark:bg-gray-700      dark:text-gray-400',
  rejected:      'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400',
};

const PRIORITY_STYLES = {
  low:    'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  high:   'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
};

const Badge = ({ value, map }) => {
  if (!value) return null;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[value] || ''}`}>
      {value}
    </span>
  );
};

const StatusModal = ({ issue, nextStatus, onClose, onConfirm, isPending }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4">
    <div className="bg-surface rounded-2xl w-full max-w-sm shadow-xl p-7">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold text-text">Update Status</h3>
        <button onClick={onClose} className="text-muted hover:text-text">
          <FiX size={20} />
        </button>
      </div>
      <p className="text-sm text-muted mb-5 truncate">
        <span className="font-medium text-text">{issue.title}</span>
      </p>
      <div className="flex items-center justify-center gap-4 mb-7">
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${STATUS_STYLES[issue.status] || ''}`}>
          {issue.status}
        </span>
        <FiArrowRight className="text-muted flex-shrink-0" size={18} />
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${STATUS_STYLES[nextStatus] || ''}`}>
          {nextStatus}
        </span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-hover transition disabled:opacity-50"
        >
          {isPending ? 'Updating…' : 'Confirm'}
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2.5 bg-surface-alt text-text font-medium rounded-lg hover:bg-border/30 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const StaffAssignedIssues = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate        = useNavigate();
  const queryClient     = useQueryClient();

  const [statusFilter,   setStatusFilter]   = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusModal,    setStatusModal]    = useState(null);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['staffIssues', currentUser?.email],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/issues?assignedStaffEmail=${encodeURIComponent(currentUser.email)}&limit=1000`
      );
      return res.data.issues;
    },
    enabled: !!currentUser?.email,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      axiosInstance.patch(`/issues/${id}/status`, { status }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['staffIssues'] });
      toast.success(`Status updated to "${status}"`);
      setStatusModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Update failed'),
  });

  const filtered = issues.filter(i => {
    if (statusFilter   && i.status   !== statusFilter)   return false;
    if (priorityFilter && i.priority !== priorityFilter) return false;
    return true;
  });

  const filterClass = 'px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm outline-none focus:ring-2 focus:ring-focus-ring';

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-7 w-40 bg-surface-alt rounded-lg mb-2" />
          <div className="h-4 w-60 bg-surface-alt rounded-lg" />
        </div>
        <div className="flex gap-3 mb-5">
          <div className="h-9 w-28 bg-surface-alt rounded-lg" />
          <div className="h-9 w-28 bg-surface-alt rounded-lg" />
        </div>
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-alt/50 border-b border-border">
              <tr>{Array.from({ length: 7 }).map((_, i) => <th key={i} className="px-5 py-4"><div className="h-3 w-16 bg-surface-alt rounded" /></th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 7 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-5 py-4"><div className="h-4 w-5 bg-surface-alt rounded" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-36 bg-surface-alt rounded" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-20 bg-surface-alt rounded" /></td>
                  <td className="px-5 py-4"><div className="h-5 w-14 bg-surface-alt rounded-full" /></td>
                  <td className="px-5 py-4"><div className="h-5 w-16 bg-surface-alt rounded-full" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-20 bg-surface-alt rounded" /></td>
                  <td className="px-5 py-4 text-right"><div className="h-7 w-20 bg-surface-alt rounded-lg ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-text">Assigned Issues</h1>
        <p className="text-sm text-muted mt-0.5">Issues assigned to you for resolution</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={filterClass}>
          <option value="">All Statuses</option>
          {FILTER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className={filterClass}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-14 text-center">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-muted">No issues match the selected filters.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-surface-alt/50 border-b border-border text-xs uppercase tracking-wider text-muted font-semibold">
                <tr>
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Assigned</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((issue, idx) => {
                  const nextStatus = NEXT_STATUS[issue.status];
                  return (
                    <tr
                      key={issue._id}
                      className={`hover:bg-surface-alt/60 transition-colors ${
                        issue.isBoosted ? 'border-l-4 border-l-amber-400' : ''
                      }`}
                    >
                      <td className="px-5 py-4 text-sm text-muted">{idx + 1}</td>
                      <td className="px-5 py-4 font-medium text-text max-w-[180px]">
                        <div className="truncate">
                          {issue.isBoosted && (
                            <span className="mr-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                              BOOSTED
                            </span>
                          )}
                          {issue.title}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">
                        {issue.category}
                      </td>
                      <td className="px-5 py-4">
                        <Badge value={issue.priority} map={PRIORITY_STYLES} />
                      </td>
                      <td className="px-5 py-4">
                        <Badge value={issue.status} map={STATUS_STYLES} />
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">
                        {new Date(issue.date).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/explore/${issue._id}`)}
                            title="View"
                            className="p-1.5 rounded-lg text-info bg-info/10 hover:bg-info/20 transition"
                          >
                            <FiExternalLink size={14} />
                          </button>
                          {nextStatus && (
                            <button
                              onClick={() => setStatusModal({ issue, nextStatus })}
                              title={`Move to ${nextStatus}`}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary hover:bg-primary-hover transition"
                            >
                              → {nextStatus}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {statusModal && (
        <StatusModal
          issue={statusModal.issue}
          nextStatus={statusModal.nextStatus}
          onClose={() => setStatusModal(null)}
          onConfirm={() =>
            statusMutation.mutate({ id: statusModal.issue._id, status: statusModal.nextStatus })
          }
          isPending={statusMutation.isPending}
        />
      )}
    </div>
  );
};

export default StaffAssignedIssues;
