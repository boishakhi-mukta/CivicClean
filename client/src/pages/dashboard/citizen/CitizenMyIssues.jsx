import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiExternalLink, FiEdit2, FiTrash2, FiX, FiZap } from 'react-icons/fi';
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
  high:   'bg-red-100    text-red-600    dark:bg-red-900/40    dark:text-red-400',
  medium: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
  low:    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
};

const BOOST_PRICE = 99;

const Badge = ({ value, map, fallback = '' }) => {
  if (!value) return fallback ? <span className="text-muted text-xs">{fallback}</span> : null;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[value] || ''}`}>
      {value}
    </span>
  );
};

const inputClass = 'w-full px-3 py-2 rounded-lg border border-border bg-surface-alt text-text outline-none focus:ring-2 focus:ring-focus-ring';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-text">Edit Issue</h3>
          <button onClick={onClose} className="text-muted hover:text-text">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          {[
            { name: 'title',    label: 'Title',    rules: { required: 'Required' } },
            { name: 'location', label: 'Location', rules: { required: 'Required' } },
          ].map(({ name, label, rules }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-text mb-1">{label}</label>
              <input {...register(name, rules)} className={inputClass} />
              {errors[name] && <p className="text-danger text-xs mt-1">{errors[name].message}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-text mb-1">Category</label>
            <select
              {...register('category', { required: 'Required' })}
              className={inputClass}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Description</label>
            <textarea
              {...register('description', { required: 'Required' })}
              rows={4}
              className={`${inputClass} resize-none`}
            />
            {errors.description && <p className="text-danger text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-hover transition disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-surface-alt text-text font-medium rounded-lg hover:bg-border/30 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BoostModal = ({ issue, onClose, onBoost, isPending }) => {
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paymentMethod) { toast.error('Select a payment method'); return; }
    onBoost({ paymentMethod });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-text flex items-center gap-2">
            <FiZap className="text-warning" size={18} />
            Boost This Issue
          </h3>
          <button onClick={onClose} className="text-muted hover:text-text">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">Issue</p>
            <p className="text-sm font-bold text-text line-clamp-2">{issue.title}</p>
          </div>
          <div className="flex items-center justify-between bg-surface-alt rounded-xl p-4">
            <div>
              <p className="text-xs text-muted">Boost Fee</p>
              <p className="text-2xl font-extrabold text-primary">kr {BOOST_PRICE}</p>
            </div>
            <div className="text-right text-xs text-muted space-y-0.5">
              <p className="font-medium text-text">Your issue gets:</p>
              <p>• Priority set to High</p>
              <p>• Pinned to top of All Issues</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className={inputClass}
            >
              <option value="">Select method</option>
              <option value="mobile-banking">Mobile Banking</option>
              <option value="card">Card</option>
              <option value="bank-transfer">Bank Transfer</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiZap size={15} />
              {isPending ? 'Processing…' : `Pay kr ${BOOST_PRICE} & Boost`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-surface-alt text-text font-medium rounded-lg hover:bg-border/30 transition"
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
  const [priorityFilter, setPriorityFilter] = useState('');
  const [editingIssue,   setEditingIssue]   = useState(null);
  const [boostingIssue,  setBoostingIssue]  = useState(null);

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

  const boostMutation = useMutation({
    mutationFn: ({ issueId, issueTitle, paymentMethod }) =>
      axiosInstance.post('/payments', {
        amount: BOOST_PRICE,
        type: 'boost',
        issueId,
        issueTitle,
        paymentMethod,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myIssues'] });
      toast.success('Issue boosted! It will now appear at the top of All Issues.');
      setBoostingIssue(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Boost failed'),
  });

  const handleDelete = (issue) => {
    if (dbUser?.isBlocked) {
      toast.error('Your account is blocked. Contact admin.');
      return;
    }
    const confirmed = window.confirm('Delete this issue?\n\nThis cannot be undone.');
    if (confirmed) deleteMutation.mutate(issue._id);
  };

  const filtered = issues.filter(i => {
    if (statusFilter   && i.status   !== statusFilter)   return false;
    if (categoryFilter && i.category !== categoryFilter) return false;
    if (priorityFilter && i.priority !== priorityFilter) return false;
    return true;
  });

  const filterClass = 'px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm outline-none focus:ring-2 focus:ring-focus-ring';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-text mb-6">My Issues</h1>

      <div className="flex flex-wrap gap-3 mb-5">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={filterClass}>
          <option value="">All Statuses</option>
          {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={filterClass}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Boost</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((issue, idx) => (
                  <tr key={issue._id} className="hover:bg-surface-alt/60 transition-colors">
                    <td className="px-5 py-4 text-sm text-muted">{idx + 1}</td>
                    <td className="px-5 py-4 font-medium text-text max-w-[180px] truncate">
                      {issue.title}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted">{issue.category}</td>
                    <td className="px-5 py-4">
                      <Badge value={issue.status} map={STATUS_STYLES} fallback="pending" />
                    </td>
                    <td className="px-5 py-4">
                      <Badge value={issue.priority} map={PRIORITY_STYLES} />
                    </td>
                    <td className="px-5 py-4 text-sm text-muted">
                      {new Date(issue.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {issue.isBoosted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                          <FiZap size={11} />
                          Boosted
                        </span>
                      ) : (
                        <button
                          onClick={() => setBoostingIssue(issue)}
                          title="Boost this issue to the top"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/40 transition"
                        >
                          <FiZap size={11} />
                          Boost
                        </button>
                      )}
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
                        {issue.status === 'pending' && (
                          <button
                            onClick={() => {
                              if (dbUser?.isBlocked) { toast.error('Your account is blocked. Contact admin.'); return; }
                              setEditingIssue(issue);
                            }}
                            title="Edit"
                            className="p-1.5 rounded-lg text-success bg-success/10 hover:bg-success/20 transition"
                          >
                            <FiEdit2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(issue)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-danger bg-danger/10 hover:bg-danger/20 transition"
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

      {boostingIssue && (
        <BoostModal
          issue={boostingIssue}
          onClose={() => setBoostingIssue(null)}
          onBoost={({ paymentMethod }) =>
            boostMutation.mutate({
              issueId: boostingIssue._id,
              issueTitle: boostingIssue.title,
              paymentMethod,
            })
          }
          isPending={boostMutation.isPending}
        />
      )}
    </div>
  );
};

export default CitizenMyIssues;
