// ─────────────────────────────────────────────────────────────────────────────
// statusConfig.js — The single source of truth for how each issue status looks.
//
// Every place in the app that shows a status badge (IssueCard, IssueTimeline,
// AdminAllIssues, etc.) uses these colours and labels so that "pending" always
// looks orange and "resolved" always looks green — no matter where it appears.
//
// Status flow: pending → in-progress → working → resolved
//              (admin can also move any issue to "rejected" at any stage)
//
// Each status entry has:
//   label  — the display text shown to the user
//   bg     — background colour class for the badge
//   text   — text colour class for the badge
//   border — border colour class (used in some layouts)
//   dot    — colour for the small circle dot in the timeline
// ─────────────────────────────────────────────────────────────────────────────

export const STATUS_CONFIG = {
  // Issue submitted but not yet assigned to a staff member
  pending: {
    label: 'Pending',
    bg:     'bg-warning/10',
    text:   'text-warning',
    border: 'border-warning/40',
    dot:    'bg-warning',
  },

  // Staff member has been assigned and has acknowledged the issue
  'in-progress': {
    label: 'In Progress',
    bg:     'bg-info/10',
    text:   'text-info',
    border: 'border-info/40',
    dot:    'bg-info',
  },

  // Staff is actively on-site or working to fix the issue
  working: {
    label: 'Working',
    bg:     'bg-info/10',
    text:   'text-info',
    border: 'border-info/40',
    dot:    'bg-info',
  },

  // Issue has been fixed and closed
  resolved: {
    label: 'Resolved',
    bg:     'bg-success/10',
    text:   'text-success',
    border: 'border-success/40',
    dot:    'bg-success',
  },

  // Issue was closed without being fixed (e.g. duplicate or out-of-scope)
  closed: {
    label: 'Closed',
    bg:     'bg-muted/10',
    text:   'text-muted',
    border: 'border-muted/40',
    dot:    'bg-muted',
  },

  // Admin rejected the issue (e.g. invalid report or policy violation)
  rejected: {
    label: 'Rejected',
    bg:     'bg-danger/10',
    text:   'text-danger',
    border: 'border-danger/40',
    dot:    'bg-danger',
  },
};

// Returns the config for a given status string.
// Falls back to "pending" style if an unknown status is passed.
export const getStatusConfig = (status) =>
  STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
