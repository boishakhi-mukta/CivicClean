import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { FiExternalLink, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { AuthContext } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosInstance';

const CATEGORIES = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];

const STATUS_STYLES = {
  pending:      'bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-400',
  'in-progress':'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-400',
  working:      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  resolved:     'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  closed:       'bg-gray-100   text-gray-700   dark:bg-gray-700      dark:text-gray-400',
  rejected:     'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400',
};

const PRIORITY_STYLES = {
  high:   'bg-red-100    text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-green-100  text-green-700',
};

const Badge = ({ value, map, fallback = '' }) => {
  if (!value) return fallback ? <span className="text-gray-400 text-xs">{fallback}</span> : null;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[value] || ''}`}>
      {value}
    </span>
  );
};

const EditModal = ({ issue, onClose, onSave, isPending }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title:       issue.title,
      description: issue.description,
      category:    issue.category,
      location:    issue.location,
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Issue</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          {[
            { name: 'title',    label: 'Title',    type: 'input',    rules: { required: 'Required' } },
            { name: 'location', label: 'Location', type: 'input',    rules: { required: 'Required' } },
          ].map(({ name, label, rules }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input
                {...register(name, rules)}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#d4ff00]"
              />
              {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              {...register('category', { required: 'Required' })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#d4ff00]"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              {...register('description', { required: 'Required' })}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#d4ff00] resize-none"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-[#1a3a2a] text-[#d4ff00] font-bold rounded-lg hover:bg-[#2c5f45] transition disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CitizenMyIssues = () => {
  const { currentUser, dbUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [statusFilter,   setStatusFilter]   = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingIssue,   setEditingIssue]   = useState(null);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['myIssues', currentUser?.email],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/issues?email=${encodeURIComponent(currentUser.email)}&limit=1000`
      );
      return res.data.issues;
    },
    enabled: !!currentUser?.email,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      axiosInstance.put(`/issues/${id}`, { ...data, email: currentUser.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myIssues'] });
      toast.success('Issue updated!');
      setEditingIssue(null);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axiosInstance.delete(`/issues/${id}`, { data: { email: currentUser.email } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myIssues'] });
      toast.success('Issue deleted!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Delete failed'),
  });

  const handleDelete = (issue) => {
    if (dbUser?.isBlocked) {
      toast.error('Your account is blocked. Contact admin.');
      return;
    }
    Swal.fire({
      title: 'Delete this issue?',
      text: 'This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e3342f',
      confirmButtonText: 'Yes, delete',
    }).then(({ isConfirmed }) => {
      if (isConfirmed) deleteMutation.mutate(issue._id);
    });
  };

  const filtered = issues.filter(i => {
    if (statusFilter   && i.status   !== statusFilter)   return false;
    if (categoryFilter && i.category !== categoryFilter) return false;
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
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6">My Issues</h1>

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
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#d4ff00]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((issue, idx) => (
                  <tr key={issue._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-400">{idx + 1}</td>
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white max-w-[180px] truncate">
                      {issue.title}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{issue.category}</td>
                    <td className="px-5 py-4">
                      <Badge value={issue.status} map={STATUS_STYLES} fallback="pending" />
                    </td>
                    <td className="px-5 py-4">
                      <Badge value={issue.priority} map={PRIORITY_STYLES} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(issue.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/issues/${issue._id}`)}
                          title="View"
                          className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 transition"
                        >
                          <FiExternalLink size={14} />
                        </button>
                        {issue.status === 'pending' && (
                          <button
                            onClick={() => {
                              if (dbUser?.isBlocked) { toast.error('Your account is blocked. Contact admin.'); return; }
                              setEditingIssue(issue);
                            }}
                            title="Edit"
                            className="p-1.5 rounded-lg text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 transition"
                          >
                            <FiEdit2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(issue)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingIssue && (
        <EditModal
          issue={editingIssue}
          onClose={() => setEditingIssue(null)}
          onSave={(data) => updateMutation.mutate({ id: editingIssue._id, data })}
          isPending={updateMutation.isPending}
        />
      )}
    </div>
  );
};

export default CitizenMyIssues;
