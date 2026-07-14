// ─────────────────────────────────────────────────────────────────────────────
// IssueCard.jsx — A single card that represents one reported civic issue.
//
// Each card shows:
//   • A photo of the issue (or a placeholder image if none was uploaded).
//   • Coloured badges for status (pending/in-progress/resolved), priority
//     (low/medium/high), and category (Garbage, Road Damage…).
//   • A "Boosted" badge if the citizen paid to pin this issue to the top.
//   • The issue title, a short description, location, date, and suggested budget.
//   • A thumbs-up button so other users can upvote the issue.
//   • A "View Details →" button that opens the full issue page.
//
// IssueCardSkeleton is the grey placeholder shown while the real cards are
// still loading — it mimics the card's shape so the page doesn't "jump".
// ─────────────────────────────────────────────────────────────────────────────

import { useContext, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiMapPin, FiThumbsUp, FiZap, FiCalendar, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { getStatusConfig } from '../constants/statusConfig';

// Colour scheme for each priority level
const PRIORITY_STYLES = {
  low:    'bg-green-100  text-green-700  dark:bg-green-900/60  dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300',
  high:   'bg-red-100    text-red-700    dark:bg-red-900/60    dark:text-red-300',
};

// Colour scheme for each issue category
const CATEGORY_STYLES = {
  'Garbage':                'bg-yellow-500 text-white',
  'Illegal Construction':   'bg-red-500    text-white',
  'Broken Public Property': 'bg-purple-500 text-white',
  'Road Damage':            'bg-gray-600   text-white',
};

// Fallback image shown when an issue has no photo
const PLACEHOLDER = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600';

// Formats a date string into a readable label like "Jan 5, 2025"
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return null;
  }
};

// ── Loading skeleton ──────────────────────────────────────────────────────────
// Grey animated placeholder shown while the real cards are being fetched.
// It has the same height and shape as a real card so the layout stays stable.
export const IssueCardSkeleton = () => (
  <div className="bg-surface rounded-xl border border-border shadow-sm flex flex-col h-[400px] overflow-hidden animate-pulse">
    <div className="h-44 bg-surface-alt flex-shrink-0" />
    <div className="p-4 flex flex-col flex-1 min-h-0">
      <div className="h-4 bg-surface-alt rounded-md w-4/5 mb-2" />
      <div className="h-3 bg-surface-alt rounded-md w-full mb-1.5" />
      <div className="h-3 bg-surface-alt rounded-md w-3/4 mb-4" />
      <div className="space-y-2 mb-auto">
        <div className="h-3 bg-surface-alt rounded-md w-1/2" />
        <div className="h-3 bg-surface-alt rounded-md w-2/3" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
        <div className="h-8 w-16 bg-surface-alt rounded-lg" />
        <div className="h-8 w-28 bg-surface-alt rounded-lg" />
      </div>
    </div>
  </div>
);

// ── Issue card ────────────────────────────────────────────────────────────────
const IssueCard = ({ issue }) => {
  const { currentUser } = useContext(AuthContext);
  const queryClient     = useQueryClient();
  const navigate        = useNavigate();

  // Check if the current user has already upvoted this issue
  const hasVoted   = !!currentUser && Array.isArray(issue.upvotes) && issue.upvotes.includes(currentUser.email);

  // Citizens cannot upvote their own issues
  const isOwnIssue = !!currentUser && issue.email === currentUser.email;

  // Sends the upvote request to the server and updates the card immediately
  // without waiting for a full page reload (optimistic local update)
  const upvoteMutation = useMutation({
    mutationFn: () => axiosInstance.patch(`/issues/${issue._id}/upvote`),
    onSuccess: (response) => {
      const updated = response.data;
      // Refresh this issue inside any cached issue list on the page
      queryClient.setQueriesData({ queryKey: ['issues'] }, (old) => {
        if (!old) return old;
        if (Array.isArray(old)) return old.map(i => i._id === updated._id ? updated : i);
        if (old?.issues) return { ...old, issues: old.issues.map(i => i._id === updated._id ? updated : i) };
        return old;
      });
      // Also refresh the individual issue detail cache
      queryClient.setQueryData(['issue', issue._id], updated);
      toast.success('Upvoted!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not upvote'),
  });

  // Called when the thumbs-up button is clicked
  const handleUpvote = useCallback((e) => {
    e.preventDefault(); // Prevent the card link from navigating away

    // If not logged in, send the user to the login page
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: `/explore/${issue._id}` } } });
      return;
    }

    // Block upvoting your own issue, double-voting, or clicking while saving
    if (isOwnIssue || hasVoted || upvoteMutation.isPending) return;
    upvoteMutation.mutate();
  }, [currentUser, isOwnIssue, hasVoted, upvoteMutation, navigate, issue._id]);

  // Look up the colour/style config for the current status (e.g. "pending" → orange)
  const statusCfg   = getStatusConfig(issue.status?.toLowerCase());
  const priorityKey = issue.priority?.toLowerCase();
  const dateStr     = formatDate(issue.date);

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-[400px] overflow-hidden group">

      {/* ── Photo area with overlay badges ── */}
      <div className="relative h-44 flex-shrink-0 overflow-hidden">
        <img
          src={issue.image || PLACEHOLDER}
          onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }} // fallback if image fails to load
          alt={issue.title}
          loading="lazy" // only download the image when it scrolls into view
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Status badge — top right corner (e.g. "pending", "resolved") */}
        <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize shadow ${statusCfg.bg} ${statusCfg.text}`}>
          {issue.status || 'pending'}
        </span>

        {/* Priority badge — top left corner (e.g. "high", "medium", "low") */}
        {priorityKey && PRIORITY_STYLES[priorityKey] && (
          <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize shadow ${PRIORITY_STYLES[priorityKey]}`}>
            {priorityKey}
          </span>
        )}

        {/* Category badge — bottom left corner */}
        {issue.category && (
          <span className={`absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded text-[11px] font-semibold shadow ${CATEGORY_STYLES[issue.category] || 'bg-blue-500 text-white'}`}>
            {issue.category}
          </span>
        )}

        {/* Boosted badge — bottom right, only visible if the citizen paid to boost it */}
        {issue.isBoosted && (
          <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-amber-900 shadow">
            <FiZap size={10} /> Boosted
          </span>
        )}
      </div>

      {/* ── Text body ── */}
      <div className="p-4 flex flex-col flex-1 min-h-0">

        {/* Issue title — truncated to one line if too long */}
        <h3 className="text-sm font-bold text-text leading-snug line-clamp-1 mb-1.5">
          {issue.title}
        </h3>

        {/* Short description — capped at 2 lines */}
        <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-3">
          {issue.description || 'No description provided for this issue.'}
        </p>

        {/* Location, date, and suggested budget row */}
        <div className="space-y-1.5 mb-auto">
          {issue.location && (
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <FiMapPin size={11} className="flex-shrink-0 text-primary" />
              <span className="truncate">{issue.location}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-xs text-muted">
            {dateStr && (
              <span className="flex items-center gap-1.5">
                <FiCalendar size={11} className="flex-shrink-0 text-primary" />
                {dateStr}
              </span>
            )}
            {issue.amount > 0 && (
              <span className="flex items-center gap-1.5">
                <FiDollarSign size={11} className="flex-shrink-0 text-primary" />
                {issue.amount.toLocaleString()} kr
              </span>
            )}
          </div>
        </div>

        {/* ── Footer: upvote button + view details link ── */}
        <div className="flex items-center justify-between pt-3 border-t border-border mt-3 gap-2">

          {/* Thumbs-up button — disabled if you own the issue or already voted */}
          <button
            onClick={handleUpvote}
            disabled={isOwnIssue || hasVoted || upvoteMutation.isPending}
            title={
              !currentUser     ? 'Login to upvote'
              : isOwnIssue     ? 'Cannot upvote your own issue'
              : hasVoted       ? 'Already upvoted'
              : 'Upvote this issue'
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
              ${hasVoted
                ? 'bg-primary/20 text-primary cursor-default'
                : 'bg-surface-alt text-muted hover:bg-primary/20 hover:text-primary'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <FiThumbsUp size={13} />
            <span>{issue.upvoteCount ?? 0}</span>
          </button>

          {/* Link to the full issue detail page */}
          <Link
            to={`/explore/${issue._id}`}
            className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors whitespace-nowrap"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
};

// memo() prevents the card from re-rendering when unrelated state changes elsewhere on the page
export default memo(IssueCard);
