import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  FiMapPin, FiCalendar, FiThumbsUp, FiEdit2, FiTrash2, FiZap, FiX,
} from 'react-icons/fi';
import { Fade } from 'react-awesome-reveal';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import ContributionModal from '../components/ContributionModal';
import IssueTimeline from '../components/IssueTimeline';
import { getStatusConfig } from '../constants/statusConfig';

const CATEGORIES = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];

const inputClass =
  'w-full px-3 py-2.5 rounded-lg border border-border bg-surface-alt text-text outline-none focus:ring-2 focus:ring-focus-ring transition';

const EditModal = ({ issue, onClose, onSave, isPending }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title:       issue.title,
      category:    issue.category,
      location:    issue.location,
      description: issue.description,
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
          <div>
            <label className="block text-sm font-medium text-text mb-1">Title</label>
            <input {...register('title', { required: 'Required' })} className={inputClass} />
            {errors.title && <p className="text-danger text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Category</label>
            <select {...register('category', { required: 'Required' })} className={inputClass}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Location</label>
            <input {...register('location', { required: 'Required' })} className={inputClass} />
            {errors.location && <p className="text-danger text-xs mt-1">{errors.location.message}</p>}
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
              className="flex-1 py-2.5 bg-surface-alt text-text font-medium rounded-lg transition hover:bg-border/20"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PAYMENT_METHODS = [
  { value: 'mobile-banking', label: 'Mobile Banking' },
  { value: 'card',           label: 'Card' },
  { value: 'bank-transfer',  label: 'Bank Transfer' },
];

const BoostModal = ({ issue, onClose, onConfirm, isPending, paymentMethod, onPaymentMethodChange }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4">
    <div className="bg-surface rounded-2xl w-full max-w-sm shadow-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-text">Boost Priority</h3>
        <button onClick={onClose} disabled={isPending} className="text-muted hover:text-text disabled:opacity-50">
          <FiX size={20} />
        </button>
      </div>
      <div className="text-center mb-6">
        <FiZap className="mx-auto text-warning mb-3" size={44} />
        <p className="text-3xl font-black text-text mb-1">100 kr</p>
        <p className="text-sm text-muted">One-time payment · Boosts your issue to High Priority</p>
        <p className="text-sm font-medium text-text mt-2 truncate">"{issue.title}"</p>
      </div>

      <div className="mb-6">
        <p className="text-sm font-semibold text-text mb-2">Payment Method</p>
        <div className="grid gap-2">
          {PAYMENT_METHODS.map(method => (
            <label
              key={method.value}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition ${
                paymentMethod === method.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-surface-alt'
              }`}
            >
              <input
                type="radio"
                name="boostPaymentMethod"
                value={method.value}
                checked={paymentMethod === method.value}
                onChange={e => onPaymentMethodChange(e.target.value)}
                disabled={isPending}
                className="accent-primary"
              />
              <span className="text-sm font-medium text-text">{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 py-3 bg-warning text-text font-bold rounded-lg hover:bg-warning/90 transition disabled:opacity-50"
        >
          {isPending ? 'Processing…' : 'Confirm Payment'}
        </button>
        <button
          onClick={onClose}
          disabled={isPending}
          className="flex-1 py-3 bg-surface-alt text-text font-medium rounded-lg transition hover:bg-border/20 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const IssueDetailPage = () => {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();
  const { currentUser, dbUser } = useContext(AuthContext);

  const [isModalOpen,        setIsModalOpen]        = useState(false);
  const [showEditModal,      setShowEditModal]       = useState(false);
  const [showBoostModal,     setShowBoostModal]      = useState(false);
  const [boostPaymentMethod, setBoostPaymentMethod]  = useState('mobile-banking');

  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue', id],
    queryFn:  async () => (await axiosInstance.get(`/issues/${id}`)).data,
  });

  useEffect(() => {
    if (issue?.title) document.title = `CivicClean | ${issue.title}`;
  }, [issue?.title]);

  const { data: contributions = [], refetch: refetchContributions } = useQuery({
    queryKey: ['donations', id],
    queryFn: async () => (await axiosInstance.get(`/donations?issueId=${id}`)).data,
  });

  const upvoteMutation = useMutation({
    mutationFn: () => axiosInstance.patch(`/issues/${id}/upvote`),
    onSuccess: (response) => {
      const updated = response.data;
      queryClient.setQueryData(['issue', id], updated);
      queryClient.setQueriesData({ queryKey: ['issues'] }, (old) => {
        if (!old) return old;
        if (Array.isArray(old)) return old.map(i => i._id === updated._id ? updated : i);
        if (old?.issues) return { ...old, issues: old.issues.map(i => i._id === updated._id ? updated : i) };
        return old;
      });
      toast.success('Upvoted!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not upvote'),
  });

  const hasVoted   = Array.isArray(issue?.upvotes) && issue.upvotes.includes(currentUser?.email);
  const isOwnIssue = issue?.email === currentUser?.email;

  const handleUpvote = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: `/explore/${id}` } } });
      return;
    }
    if (dbUser?.isBlocked) { toast.error('Your account is blocked. Contact admin.'); return; }
    if (isOwnIssue || hasVoted || upvoteMutation.isPending) return;
    upvoteMutation.mutate();
  };

  const boostMutation = useMutation({
    mutationFn: () =>
      axiosInstance.post('/payments', {
        type: 'boost', amount: 100, issueId: id, issueTitle: issue.title,
        paymentMethod: boostPaymentMethod,
      }),
    onSuccess: () => {
      setShowBoostModal(false);
      setBoostPaymentMethod('mobile-banking');
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      queryClient.invalidateQueries({ queryKey: ['adminPayments'] });
      toast.success('Issue boosted! It is now marked as High Priority.');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Payment failed'),
  });

  const editMutation = useMutation({
    mutationFn: (data) =>
      axiosInstance.put(`/issues/${id}`, { ...data, email: currentUser.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      toast.success('Issue updated!');
      setShowEditModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      axiosInstance.delete(`/issues/${id}`, { data: { email: currentUser.email } }),
    onSuccess: () => {
      toast.success('Issue deleted');
      navigate('/explore');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Delete failed'),
  });

  const handleDelete = () => {
    if (window.confirm('Delete this issue? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center bg-bg transition-colors">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary" />
        <p className="mt-4 text-muted font-medium">Loading issue details…</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex justify-center items-center bg-bg transition-colors">
        <div className="text-center p-8 bg-surface rounded-2xl shadow-sm border border-border">
          <h2 className="text-2xl font-bold text-text mb-2">Issue Not Found</h2>
          <p className="text-muted">The issue you are looking for does not exist or was removed.</p>
        </div>
      </div>
    );
  }

  const totalCollected  = contributions.reduce((sum, c) => sum + c.amount, 0);
  const suggestedBudget = issue.amount || 1;
  const progressPercent = Math.min(Math.round((totalCollected / suggestedBudget) * 100), 100);
  const placeholderImage = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=1200';

  const statusCfg = getStatusConfig(issue.status?.toLowerCase());

  const showBoostBtn  = currentUser && !issue.isBoosted && isOwnIssue && !dbUser?.isBlocked;
  const showEditBtn   = isOwnIssue && issue.status === 'pending';
  const showDeleteBtn = isOwnIssue;

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-8">

        <Fade direction="up" triggerOnce>
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-72 lg:h-auto relative">
                <img
                  src={issue.image || placeholderImage}
                  alt={issue.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              <div className="p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-primary text-on-primary rounded-md text-sm font-bold shadow-sm">
                      {issue.category}
                    </span>
                    <span className={`px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider shadow-sm ${statusCfg.bg} ${statusCfg.text}`}>
                      {issue.status || 'pending'}
                    </span>

                    {showBoostBtn && (
                      <button
                        onClick={() => setShowBoostModal(true)}
                        className="px-3 py-1 bg-warning/10 text-warning rounded-md text-sm font-bold shadow-sm flex items-center gap-1.5 hover:bg-warning/20 transition-colors"
                      >
                        <FiZap size={13} /> Boost 100 kr
                      </button>
                    )}
                    {issue.isBoosted && (
                      <span className="px-3 py-1 bg-warning/20 text-warning rounded-md text-sm font-bold flex items-center gap-1">
                        <FiZap size={13} /> Boosted
                      </span>
                    )}

                    {showEditBtn && (
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="px-3 py-1 bg-success/10 text-success rounded-md text-sm font-bold flex items-center gap-1.5 hover:bg-success/20 transition-colors"
                      >
                        <FiEdit2 size={13} /> Edit
                      </button>
                    )}

                    {showDeleteBtn && (
                      <button
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-1 bg-danger/10 text-danger rounded-md text-sm font-bold flex items-center gap-1.5 hover:bg-danger/20 transition-colors disabled:opacity-50"
                      >
                        <FiTrash2 size={13} /> Delete
                      </button>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-extrabold text-text mb-4 leading-tight">
                    {issue.title}
                  </h1>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-muted">
                      <FiMapPin className="mr-3 flex-shrink-0 text-xl text-primary" />
                      <span className="text-lg">{issue.location}</span>
                    </div>
                    <div className="flex items-center text-muted">
                      <FiCalendar className="mr-3 flex-shrink-0 text-xl text-primary" />
                      <span className="text-lg">
                        {issue.date && !isNaN(new Date(issue.date))
                          ? new Date(issue.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                          : 'Unknown Date'}
                      </span>
                    </div>
                  </div>

                  <p className="text-muted text-base leading-relaxed mb-8 whitespace-pre-wrap">{issue.description}</p>
                </div>

                {/* Upvote */}
                <div className="flex items-center gap-5 mb-6 p-4 bg-surface-alt rounded-xl border border-border">
                  <button
                    onClick={handleUpvote}
                    disabled={isOwnIssue || hasVoted || upvoteMutation.isPending}
                    title={
                      !currentUser ? 'Login to upvote'
                      : isOwnIssue  ? 'Cannot upvote your own issue'
                      : hasVoted    ? 'Already upvoted'
                                    : 'Upvote this issue'
                    }
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
                      ${hasVoted
                        ? 'bg-primary/20 text-primary cursor-default shadow-sm'
                        : isOwnIssue
                        ? 'bg-surface-alt text-muted cursor-not-allowed'
                        : 'bg-primary text-on-primary hover:bg-primary-hover shadow-sm'
                      } disabled:opacity-60`}
                  >
                    <FiThumbsUp size={16} />
                    {hasVoted ? 'Upvoted' : 'Upvote'}
                  </button>
                  <div>
                    <p className="text-2xl font-extrabold text-text leading-none">{issue.upvoteCount ?? 0}</p>
                    <p className="text-xs text-muted mt-0.5">community votes</p>
                  </div>
                  {!currentUser && (
                    <p className="text-xs text-muted ml-auto">
                      <button onClick={handleUpvote} className="underline text-primary">Login</button> to upvote
                    </p>
                  )}
                </div>

                {/* Budget */}
                <div className="bg-surface-alt p-6 rounded-xl border border-border">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-sm font-semibold text-muted uppercase tracking-wide">Suggested Budget</p>
                      <p className="text-2xl font-extrabold text-text">{suggestedBudget} kr</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-muted uppercase tracking-wide">Collected</p>
                      <p className="text-2xl font-extrabold text-primary">{totalCollected} kr</p>
                    </div>
                  </div>
                  <div className="w-full bg-border/30 rounded-full h-3 mb-2 overflow-hidden">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted font-medium text-right mb-6">{progressPercent}% Funded</p>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        navigate('/login', { state: { from: { pathname: `/explore/${id}` } } });
                        return;
                      }
                      setIsModalOpen(true);
                    }}
                    className="w-full py-4 bg-primary text-on-primary text-lg font-bold rounded-lg hover:bg-primary-hover transition transform hover:-translate-y-1 shadow-md"
                  >
                    Pay Clean-Up Contribution
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Fade>

        {/* Contributors */}
        <Fade direction="up" triggerOnce delay={100}>
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-8 md:p-10">
            <h2 className="text-2xl font-extrabold text-text mb-6">
              Contributors ({contributions.length})
            </h2>
            {contributions.length === 0 ? (
              <p className="text-muted italic bg-surface-alt p-6 rounded-xl border border-border text-center">
                No contributions yet. Be the first to support this clean-up!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-4 px-4 font-semibold text-muted uppercase text-sm tracking-wider">Contributor</th>
                      <th className="py-4 px-4 font-semibold text-muted uppercase text-sm tracking-wider">Date</th>
                      <th className="py-4 px-4 font-semibold text-muted uppercase text-sm tracking-wider text-right">Amount (kr)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map(c => (
                      <tr key={c._id} className="border-b border-border/30 hover:bg-surface-alt transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold mr-3 flex-shrink-0">
                              {c.name ? c.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <p className="font-semibold text-text">{c.name || 'Anonymous'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted">
                          {c.date && !isNaN(new Date(c.date)) ? new Date(c.date).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-text">
                          {c.amount} kr
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Fade>

        <Fade direction="up" triggerOnce delay={150}>
          <IssueTimeline timeline={issue.timeline || []} />
        </Fade>
      </div>

      {isModalOpen && (
        <ContributionModal
          issue={issue}
          onClose={() => setIsModalOpen(false)}
          onContributionSuccess={() => refetchContributions()}
        />
      )}

      {showEditModal && (
        <EditModal
          issue={issue}
          onClose={() => setShowEditModal(false)}
          onSave={(data) => editMutation.mutate(data)}
          isPending={editMutation.isPending}
        />
      )}

      {showBoostModal && (
        <BoostModal
          issue={issue}
          onClose={() => !boostMutation.isPending && setShowBoostModal(false)}
          onConfirm={() => boostMutation.mutate()}
          isPending={boostMutation.isPending}
          paymentMethod={boostPaymentMethod}
          onPaymentMethodChange={setBoostPaymentMethod}
        />
      )}
    </div>
  );
};

export default IssueDetailPage;
