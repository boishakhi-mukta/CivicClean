import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiMapPin, FiThumbsUp, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { getStatusConfig } from '../constants/statusConfig';

const PRIORITY_STYLES = {
  low:    'bg-green-100  text-green-700  dark:bg-green-900/60  dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300',
  high:   'bg-red-100    text-red-700    dark:bg-red-900/60    dark:text-red-300',
};

const CATEGORY_STYLES = {
  'Garbage':                'bg-yellow-500 text-white',
  'Illegal Construction':   'bg-red-500    text-white',
  'Broken Public Property': 'bg-purple-500 text-white',
  'Road Damage':            'bg-gray-600   text-white',
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600';

const IssueCard = ({ issue }) => {
  const { currentUser } = useContext(AuthContext);
  const queryClient     = useQueryClient();
  const navigate        = useNavigate();

  const hasVoted   = !!currentUser && Array.isArray(issue.upvotes) && issue.upvotes.includes(currentUser.email);
  const isOwnIssue = !!currentUser && issue.email === currentUser.email;

  const upvoteMutation = useMutation({
    mutationFn: () => axiosInstance.patch(`/issues/${issue._id}/upvote`),
    onSuccess: (response) => {
      const updated = response.data;
      queryClient.setQueriesData({ queryKey: ['issues'] }, (old) => {
        if (!old) return old;
        if (Array.isArray(old)) return old.map(i => i._id === updated._id ? updated : i);
        if (old?.issues) return { ...old, issues: old.issues.map(i => i._id === updated._id ? updated : i) };
        return old;
      });
      queryClient.setQueryData(['issue', issue._id], updated);
      toast.success('Upvoted!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not upvote'),
  });

  const handleUpvote = (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: `/all-issues/${issue._id}` } } });
      return;
    }
    if (isOwnIssue || hasVoted || upvoteMutation.isPending) return;
    upvoteMutation.mutate();
  };

  const statusCfg  = getStatusConfig(issue.status?.toLowerCase());
  const priorityKey = issue.priority?.toLowerCase();

  return (
    <div className="bg-surface rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-border flex flex-col h-full">

      <div className="relative h-44 overflow-hidden flex-shrink-0">
        <img
          src={issue.image || PLACEHOLDER}
          onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
          alt={issue.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />

        <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize shadow-sm ${statusCfg.bg} ${statusCfg.text}`}>
          {issue.status || 'pending'}
        </span>

        {priorityKey && PRIORITY_STYLES[priorityKey] && (
          <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize shadow-sm ${PRIORITY_STYLES[priorityKey]}`}>
            {priorityKey}
          </span>
        )}

        {issue.category && (
          <span className={`absolute bottom-3 left-3 px-2 py-0.5 rounded text-[11px] font-semibold shadow-sm ${CATEGORY_STYLES[issue.category] || 'bg-blue-500 text-white'}`}>
            {issue.category}
          </span>
        )}

        {issue.isBoosted && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-amber-900 shadow-sm">
            <FiZap size={10} /> Boosted
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-base font-bold text-text mb-2 line-clamp-2 leading-snug">
          {issue.title}
        </h3>

        {issue.location && (
          <div className="flex items-center gap-1 text-muted text-xs mb-3">
            <FiMapPin size={12} className="flex-shrink-0" />
            <span className="truncate">{issue.location}</span>
          </div>
        )}

        <div className="flex-grow" />

        <div className="flex items-center justify-between pt-4 border-t border-border mt-3 gap-2">
          <button
            onClick={handleUpvote}
            disabled={isOwnIssue || hasVoted || upvoteMutation.isPending}
            title={
              !currentUser ? 'Login to upvote'
              : isOwnIssue ? 'Cannot upvote your own issue'
              : hasVoted   ? 'Already upvoted'
                           : 'Upvote this issue'
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors
              ${hasVoted
                ? 'bg-primary/20 text-primary cursor-default'
                : 'bg-surface-alt text-muted hover:bg-primary/20 hover:text-primary'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <FiThumbsUp size={14} />
            <span>{issue.upvoteCount ?? 0}</span>
          </button>

          <Link
            to={`/all-issues/${issue._id}`}
            className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
