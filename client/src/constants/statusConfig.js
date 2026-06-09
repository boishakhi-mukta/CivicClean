/**
 * Single source of truth for issue status presentation.
 * All Tailwind classes here use semantic token utilities only —
 * no hard-coded palette classes or arbitrary hex values.
 */
export const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    bg:     'bg-warning/10',
    text:   'text-warning',
    border: 'border-warning/40',
    dot:    'bg-warning',
  },
  'in-progress': {
    label: 'In Progress',
    bg:     'bg-info/10',
    text:   'text-info',
    border: 'border-info/40',
    dot:    'bg-info',
  },
  working: {
    label: 'Working',
    bg:     'bg-info/10',
    text:   'text-info',
    border: 'border-info/40',
    dot:    'bg-info',
  },
  resolved: {
    label: 'Resolved',
    bg:     'bg-success/10',
    text:   'text-success',
    border: 'border-success/40',
    dot:    'bg-success',
  },
  closed: {
    label: 'Closed',
    bg:     'bg-muted/10',
    text:   'text-muted',
    border: 'border-muted/40',
    dot:    'bg-muted',
  },
  rejected: {
    label: 'Rejected',
    bg:     'bg-danger/10',
    text:   'text-danger',
    border: 'border-danger/40',
    dot:    'bg-danger',
  },
};

/** Returns the config for a given status, falling back to 'pending'. */
export const getStatusConfig = (status) =>
  STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
