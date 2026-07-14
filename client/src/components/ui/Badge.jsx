// ─────────────────────────────────────────────────────────────────────────────
// Badge.jsx — Small coloured label used to tag things with a category or state.
//
// Two exports:
//
//   Badge        — generic badge; you choose the colour with the `variant` prop.
//                  Variants: default | primary | success | warning | danger | info
//                  Sizes:    xs | sm | md
//                  Set `dot={true}` to show a small coloured dot before the text.
//
//   StatusBadge  — a specialised badge that reads the issue status (e.g. "pending",
//                  "resolved") and automatically applies the correct colour and dot
//                  from the shared statusConfig so all status labels look consistent
//                  across the whole site.
// ─────────────────────────────────────────────────────────────────────────────

import { getStatusConfig } from '../../constants/statusConfig';

// Colour mapping for each variant name
const VARIANT_CLASSES = {
  default: 'bg-muted/10 text-muted',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger:  'bg-danger/10 text-danger',
  info:    'bg-info/10 text-info',
};

// Padding + font-size for each size
const SIZES = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

// Generic badge — any colour, any size, optional dot
const Badge = ({ children, variant = 'default', size = 'sm', dot = false, className = '', ...props }) => {
  const base = [
    'inline-flex items-center gap-1.5 font-semibold rounded-full',
    VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default,
    SIZES[size] ?? SIZES.sm,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={base} {...props}>
      {/* Optional tiny coloured circle before the label text */}
      {dot && <span className={`w-1.5 h-1.5 rounded-full bg-current flex-shrink-0`} />}
      {children}
    </span>
  );
};

// Status-aware badge — automatically picks colour and dot from the issue's status
export const StatusBadge = ({ status, size = 'sm', className = '' }) => {
  const cfg = getStatusConfig(status?.toLowerCase());
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-semibold rounded-full capitalize',
        cfg.bg, cfg.text,
        SIZES[size] ?? SIZES.sm,
        className,
      ].filter(Boolean).join(' ')}
    >
      {/* Dot whose colour matches the status (e.g. orange for pending) */}
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default Badge;
