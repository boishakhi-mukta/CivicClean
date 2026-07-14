// ─────────────────────────────────────────────────────────────────────────────
// Card.jsx — A white/surface-coloured box with rounded corners used to group
// related content on the page.
//
// Exports:
//   Card        — the outer container.  Props:
//                   padding  — "none" | "sm" | "md" (default) | "lg"
//                   flat     — removes the subtle drop shadow
//                   as       — renders as a different HTML tag (e.g. "article")
//
//   CardHeader  — a section at the top of a card with a bottom divider line.
//                 Typically holds a title and maybe an action button.
//
//   CardTitle   — the heading inside a CardHeader.
//                 Defaults to <h2> but can be changed with the `as` prop.
//
//   CardFooter  — a section at the bottom of a card with a top divider line.
//                 Typically holds action buttons (Save, Cancel, etc.).
// ─────────────────────────────────────────────────────────────────────────────

// Padding sizes mapped to Tailwind classes
const PADDING = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

// Main card container
const Card = ({ children, className = '', padding = 'md', flat = false, as: Tag = 'div', ...props }) => {
  const base = [
    'bg-surface rounded-xl border border-border',
    flat ? '' : 'shadow-sm', // flat cards have no shadow
    PADDING[padding] ?? PADDING.md,
    className,
  ].filter(Boolean).join(' ');

  return <Tag className={base} {...props}>{children}</Tag>;
};

// Top section of a card, separated from the body by a horizontal line
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`pb-4 mb-4 border-b border-border ${className}`} {...props}>
    {children}
  </div>
);

// Heading text inside a card header
export const CardTitle = ({ children, className = '', as: Tag = 'h2', ...props }) => (
  <Tag className={`text-lg font-bold text-text ${className}`} {...props}>{children}</Tag>
);

// Bottom section of a card, separated from the body by a horizontal line
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`pt-4 mt-4 border-t border-border ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
