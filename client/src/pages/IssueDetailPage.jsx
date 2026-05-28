import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import {
  FiMapPin, FiCalendar, FiThumbsUp, FiEdit2, FiTrash2, FiZap, FiX,
} from 'react-icons/fi';
import { Fade } from 'react-awesome-reveal';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import ContributionModal from '../components/ContributionModal';
import IssueTimeline from '../components/IssueTimeline';

const CATEGORIES = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];

const inputClass =
  'w-full px-3 py-2.5 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#d4ff00] transition';

// ── Edit Modal ────────────────────────────────────────────────────────────────
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Issue</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input {...register('title', { required: 'Required' })} className={inputClass} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select {...register('category', { required: 'Required' })} className={inputClass}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <input {...register('location', { required: 'Required' })} className={inputClass} />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              {...register('description', { required: 'Required' })}
              rows={4}
              className={`${inputClass} resize-none`}
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
              className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Boost Modal ───────────────────────────────────────────────────────────────
const BoostModal = ({ issue, onClose, onConfirm, isPending }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Boost Priority</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <FiX size={20} />
        </button>
      </div>
      <div className="text-center mb-8">
        <FiZap className="mx-auto text-amber-400 mb-3" size={44} />
        <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">৳100</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          One-time payment · Boosts your issue to High Priority
        </p>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-3 truncate">
          "{issue.title}"
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 py-3 bg-[#d4ff00] text-[#1a3a2a] font-bold rounded-lg hover:bg-[#bce600] transition disabled:opacity-50"
        >
          {isPending ? 'Processing…' : 'Confirm Payment'}
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const IssueDetailPage = () => {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();
  const { currentUser, dbUser } = useContext(AuthContext);

  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [showEditModal,  setShowEditModal]  = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);

  // TanStack Query for the issue
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

  // ── Upvote ─────────────────────────────────────────────────────────────────
  const upvoteMutation = useMutation({
    mutationFn: () => axiosInstance.patch(`/issues/${id}/upvote`),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      toast.success('Upvoted!');
    },
    onError:    (err) => toast.error(err.response?.data?.message || 'Could not upvote'),
  });

  const hasVoted   = issue?.upvotes?.includes(currentUser?.email);
  const isOwnIssue = issue?.email === currentUser?.email;

  const handleUpvote = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: `/issues/${id}` } } });
      return;
    }
    if (dbUser?.isBlocked) {
      toast.error('Your account is blocked. Contact admin.');
      return;
    }
    if (isOwnIssue || hasVoted) return;
    upvoteMutation.mutate();
  };

  // ── Boost ──────────────────────────────────────────────────────────────────
  const boostMutation = useMutation({
    mutationFn: () =>
      axiosInstance.post('/payments', {
        type: 'boost', amount: 100, issueId: id, issueTitle: issue.title,
      }),
    onSuccess: async () => {
      setShowBoostModal(false);
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      await Swal.fire({
        icon: 'success',
        title: 'Issue Boosted!',
        text: 'Your issue is now marked as High Priority.',
        confirmButtonColor: '#1a3a2a',
      });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Payment failed'),
  });

  // ── Edit ───────────────────────────────────────────────────────────────────
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

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: () =>
      axiosInstance.delete(`/issues/${id}`, { data: { email: currentUser.email } }),
    onSuccess: () => {
      toast.success('Issue deleted');
      navigate('/issues');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Delete failed'),
  });

  const handleDelete = async () => {
    const { isConfirmed } = await Swal.fire({
      title: 'Delete this issue?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      confirmButtonColor: '#e3342f',
    });
    if (isConfirmed) deleteMutation.mutate();
  };

  // ── Loading / not found ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00]" />
        <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading issue details…</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex justify-center items-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Issue Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400">The issue you are looking for does not exist or was removed.</p>
        </div>
      </div>
    );
  }

  const totalCollected  = contributions.reduce((sum, c) => sum + c.amount, 0);
  const suggestedBudget = issue.amount || 1;
  const progressPercent = Math.min(Math.round((totalCollected / suggestedBudget) * 100), 100);
  const placeholderImage = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=1200';

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'resolved' || s === 'closed') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (s === 'rejected') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
  };

  const showBoostBtn = currentUser && !issue.isBoosted && isOwnIssue && !dbUser?.isBlocked;
  const showEditBtn  = isOwnIssue && issue.status === 'pending';
  const showDeleteBtn = isOwnIssue;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-8">

        <Fade direction="up" triggerOnce>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image */}
              <div className="h-72 lg:h-auto relative">
                <img
                  src={issue.image || placeholderImage}
                  alt={issue.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="p-8 md:p-10 flex flex-col justify-between">
                <div>
                  {/* Badges + action buttons row */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-[#1a3a2a] text-white dark:bg-[#d4ff00] dark:text-[#1a3a2a] rounded-md text-sm font-bold shadow-sm">
                      {issue.category}
                    </span>
                    <span className={`px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider shadow-sm ${getStatusColor(issue.status)}`}>
                      {issue.status || 'pending'}
                    </span>

                    {/* Upvote */}
                    <button
                      onClick={handleUpvote}
                      disabled={isOwnIssue || hasVoted || upvoteMutation.isPending}
                      title={isOwnIssue ? 'Cannot upvote your own issue' : hasVoted ? 'Already upvoted' : 'Upvote'}
                      className={`px-3 py-1 rounded-md text-sm font-bold shadow-sm flex items-center gap-1.5 transition-colors ${
                        hasVoted
                          ? 'bg-blue-600 text-white cursor-default'
                          : isOwnIssue
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200'
                      }`}
                    >
                      <FiThumbsUp size={14} /> {issue.upvoteCount || 0}
                    </button>

                    {/* Boost */}
                    {showBoostBtn && (
                      <button
                        onClick={() => setShowBoostModal(true)}
                        className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded-md text-sm font-bold shadow-sm flex items-center gap-1.5 hover:bg-amber-200 transition-colors"
                      >
                        <FiZap size={13} /> Boost ৳100
                      </button>
                    )}
                    {issue.isBoosted && (
                      <span className="px-3 py-1 bg-amber-400/20 text-amber-700 rounded-md text-sm font-bold flex items-center gap-1">
                        <FiZap size={13} /> Boosted
                      </span>
                    )}

                    {/* Edit */}
                    {showEditBtn && (
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-md text-sm font-bold flex items-center gap-1.5 hover:bg-green-200 transition-colors"
                      >
                        <FiEdit2 size={13} /> Edit
                      </button>
                    )}

                    {/* Delete */}
                    {showDeleteBtn && (
                      <button
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-md text-sm font-bold flex items-center gap-1.5 hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        <FiTrash2 size={13} /> Delete
                      </button>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                    {issue.title}
                  </h1>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FiMapPin className="mr-3 flex-shrink-0 text-xl text-[#1a3a2a] dark:text-[#d4ff00]" />
                      <span className="text-lg">{issue.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FiCalendar className="mr-3 flex-shrink-0 text-xl text-[#1a3a2a] dark:text-[#d4ff00]" />
                      <span className="text-lg">
                        {issue.date && !isNaN(new Date(issue.date))
                          ? new Date(issue.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                          : 'Unknown Date'}
                      </span>
                    </div>
                  </div>

                  <div className="prose prose-lg dark:prose-invert max-w-none mb-8 text-gray-600 dark:text-gray-300">
                    <p className="whitespace-pre-wrap">{issue.description}</p>
                  </div>
                </div>

                {/* Budget section */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-600">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Suggested Budget</p>
                      <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{suggestedBudget} NOK</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Collected</p>
                      <p className="text-2xl font-extrabold text-[#1a3a2a] dark:text-[#d4ff00]">{totalCollected} NOK</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-2 overflow-hidden">
                    <div
                      className="bg-[#1a3a2a] dark:bg-[#d4ff00] h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium text-right mb-6">
                    {progressPercent}% Funded
                  </p>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        navigate('/login', { state: { from: { pathname: `/issues/${id}` } } });
                        return;
                      }
                      setIsModalOpen(true);
                    }}
                    className="w-full py-4 bg-[#d4ff00] text-[#1a3a2a] text-lg font-bold rounded-lg hover:bg-[#bce600] transition transform hover:-translate-y-1 shadow-md"
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 md:p-10">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">
              Contributors ({contributions.length})
            </h2>
            {contributions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-600 text-center">
                No contributions yet. Be the first to support this clean-up!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-4 px-4 font-semibold text-gray-500 dark:text-gray-400 uppercase text-sm tracking-wider">Contributor</th>
                      <th className="py-4 px-4 font-semibold text-gray-500 dark:text-gray-400 uppercase text-sm tracking-wider">Date</th>
                      <th className="py-4 px-4 font-semibold text-gray-500 dark:text-gray-400 uppercase text-sm tracking-wider text-right">Amount (NOK)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map(c => (
                      <tr key={c._id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-[#1a3a2a] text-[#d4ff00] flex items-center justify-center font-bold mr-3 flex-shrink-0">
                              {c.name ? c.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white">{c.name || 'Anonymous'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {c.date && !isNaN(new Date(c.date)) ? new Date(c.date).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-white">
                          {c.amount} NOK
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Fade>

        {/* Timeline */}
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
          onClose={() => setShowBoostModal(false)}
          onConfirm={() => boostMutation.mutate()}
          isPending={boostMutation.isPending}
        />
      )}
    </div>
  );
};

export default IssueDetailPage;
