// ─────────────────────────────────────────────────────────────────────────────
// Table.jsx — Reusable table components for displaying lists of data.
//
// Used in all dashboard screens that show tabular data — e.g. the admin's list
// of all issues, the payments table, the users list, and the staff list.
//
// The outer Table wrapper adds a scrollable container so wide tables on phones
// scroll horizontally instead of breaking the layout.
//
// Exports (use them together like a normal HTML table):
//   Table  — outer container with card styling and horizontal scroll
//   Thead  — table header (grey background, uppercase column labels)
//   Tbody  — table body (rows separated by thin divider lines)
//   Th     — a single header cell
//   Td     — a single data cell
//   Tr     — a table row; highlights on hover by default (set hover={false} to disable)
// ─────────────────────────────────────────────────────────────────────────────

// Outer container — card-style border, rounded corners, and horizontal scroll
const Table = ({ children, className = '' }) => (
  <div className={`bg-surface rounded-xl border border-border shadow-sm overflow-hidden ${className}`}>
    {/* overflow-x-auto lets the table scroll sideways on narrow screens */}
    <div className="overflow-x-auto">
      <table className="w-full text-left whitespace-nowrap">{children}</table>
    </div>
  </div>
);

// Header row container — slightly shaded background with small caps text
export const Thead = ({ children, className = '' }) => (
  <thead className={`bg-surface-alt/50 border-b border-border text-xs uppercase tracking-wider text-muted font-semibold ${className}`}>
    {children}
  </thead>
);

// Body container — divider lines between every row
export const Tbody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-border ${className}`}>{children}</tbody>
);

// Header cell — bold column label (e.g. "Status", "Date", "Actions")
export const Th = ({ children, className = '', align = 'left', ...props }) => (
  <th className={`px-5 py-4 text-${align} ${className}`} {...props}>{children}</th>
);

// Data cell — holds the actual content for each row/column intersection
export const Td = ({ children, className = '', align = 'left', ...props }) => (
  <td className={`px-5 py-4 text-${align} ${className}`} {...props}>{children}</td>
);

// Table row — highlights with a subtle background on hover for readability
export const Tr = ({ children, className = '', hover = true, ...props }) => (
  <tr
    className={[hover ? 'hover:bg-surface-alt/60 transition-colors' : '', className].filter(Boolean).join(' ')}
    {...props}
  >
    {children}
  </tr>
);

export default Table;
