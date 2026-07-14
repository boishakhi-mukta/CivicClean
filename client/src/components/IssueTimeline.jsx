// ─────────────────────────────────────────────────────────────────────────────
// IssueTimeline.jsx — A vertical history log of everything that happened to an issue.
//
// Every time a staff member or admin changes the status of an issue
// (e.g. "pending → in-progress") a new entry is added to the timeline.
// Each entry shows:
//   • A coloured dot on the vertical line matching the status colour.
//   • A status badge (e.g. "In Progress") and a role badge (e.g. "staff").
//   • The message/note left by the person who made the update.
//   • Who made the update and when.
//
// Entries are shown newest-first so the most recent change is at the top.
// ─────────────────────────────────────────────────────────────────────────────

import { getStatusConfig } from '../constants/statusConfig';

// Colour coding for the role badge next to each timeline entry
const ROLE_COLORS = {
  admin:   'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  staff:   'bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300',
  citizen: 'bg-surface-alt text-muted',
};

// Converts a date into a readable format like "Jan 5, 2025, 3:42 PM"
const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d)) return '—';
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
};

const IssueTimeline = ({ timeline = [] }) => {
  // Reverse the array so the most recent update appears first at the top
  const sorted = [...timeline].reverse();

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border p-8 md:p-10">
      <h2 className="text-2xl font-extrabold text-text mb-6">Issue Timeline</h2>

      {/* Show a friendly message when no updates have been made yet */}
      {sorted.length === 0 ? (
        <p className="text-muted italic text-center py-6">No updates yet.</p>
      ) : (
        <div className="relative">
          {/* The vertical line running down the left side of the timeline */}
          <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-border" />

          <div className="space-y-6">
            {sorted.map((entry, idx) => {
              // Get the colour config that matches this entry's status
              const cfg = getStatusConfig(entry.status?.toLowerCase());
              return (
                <div key={idx} className="relative flex gap-5 pl-10">

                  {/* Coloured dot on the timeline line */}
                  <span
                    className={`absolute left-2 top-1.5 w-3 h-3 rounded-full ring-2 ring-bg flex-shrink-0 ${cfg.dot}`}
                  />

                  <div className="flex-1 pb-1">
                    {/* Status badge + role badge side by side */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {entry.status && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${cfg.bg} ${cfg.text}`}>
                          {entry.status}
                        </span>
                      )}
                      {entry.role && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[entry.role] || 'bg-surface-alt text-muted'}`}>
                          {entry.role}
                        </span>
                      )}
                    </div>

                    {/* The note or message left by the person who made this update */}
                    <p className="text-sm text-text font-medium leading-relaxed">{entry.message}</p>

                    {/* Who made the update and when */}
                    <div className="flex flex-wrap gap-x-3 mt-1.5 text-xs text-muted">
                      {entry.updatedBy && <span>By: {entry.updatedBy}</span>}
                      <span>{formatDate(entry.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueTimeline;
