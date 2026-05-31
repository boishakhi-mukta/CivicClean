import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiExternalLink, FiArrowRight, FiX } from 'react-icons/fi';
import { AuthContext } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosInstance';

// Only forward transitions are allowed
const NEXT_STATUS = {
  'pending':     'in-progress',
  'in-progress': 'working',
  'working':     'resolved',
  'resolved':    'closed',
};

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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-xl p-7">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Update Status</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <FiX size={20} />
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 truncate">
        <span className="font-medium text-gray-700 dark:text-gray-300">{issue.title}</span>
      </p>
      <div className="flex items-center justify-center gap-4 mb-7">
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${STATUS_STYLES[issue.status] || ''}`}>
          {issue.status}
        </span>
        <FiArrowRight className="text-gray-400 flex-shrink-0" size={18} />
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${STATUS_STYLES[nextStatus] || ''}`}>
          {nextStatus}
        </span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 py-2.5 bg-[#1a3a2a] text-[#d4ff00] font-bold rounded-lg hover:bg-[#2c5f45] transition disabled:opacity-50"
        >
          {isPending ? 'Updating…' : 'Confirm'}
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
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
  const [statusModal,    setStatusModal]    = useState(null); // { issue, nextStatus }

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
        Assigned Issues
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#d4ff00]"
        >
          <option value="">All Statuses</option>
          {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#d4ff00]"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-14 text-center">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-gray-500 dark:text-gray-400">No issues match the selected filters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
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
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((issue, idx) => {
                  const nextStatus = NEXT_STATUS[issue.status];
                  return (
                    <tr
                      key={issue._id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                        issue.isBoosted ? 'border-l-4 border-l-amber-400' : ''
                      }`}
                    >
                      <td className="px-5 py-4 text-sm text-gray-400">{idx + 1}</td>
                      <td className="px-5 py-4 font-medium text-gray-900 dark:text-white max-w-[180px]">
                        <div className="truncate">
                          {issue.isBoosted && (
                            <span className="mr-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                              BOOSTED
                            </span>
                          )}
                          {issue.title}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {issue.category}
                      </td>
                      <td className="px-5 py-4">
                        <Badge value={issue.priority} map={PRIORITY_STYLES} />
                      </td>
                      <td className="px-5 py-4">
                        <Badge value={issue.status} map={STATUS_STYLES} />
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(issue.date).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/all-issues/${issue._id}`)}
                            title="View"
                            className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 transition"
                          >
                            <FiExternalLink size={14} />
                          </button>
                          {nextStatus && (
                            <button
                              onClick={() => setStatusModal({ issue, nextStatus })}
                              title={`Move to ${nextStatus}`}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a3a2a] text-[#d4ff00] hover:bg-[#2c5f45] transition"
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
