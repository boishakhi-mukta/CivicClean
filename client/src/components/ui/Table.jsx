const Table = ({ children, className = '' }) => (
  <div className={`bg-surface rounded-xl border border-border shadow-sm overflow-hidden ${className}`}>
    <div className="overflow-x-auto">
      <table className="w-full text-left whitespace-nowrap">{children}</table>
    </div>
  </div>
);

export const Thead = ({ children, className = '' }) => (
  <thead className={`bg-surface-alt/50 border-b border-border text-xs uppercase tracking-wider text-muted font-semibold ${className}`}>
    {children}
  </thead>
);

export const Tbody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-border ${className}`}>{children}</tbody>
);

export const Th = ({ children, className = '', align = 'left', ...props }) => (
  <th className={`px-5 py-4 text-${align} ${className}`} {...props}>{children}</th>
);

export const Td = ({ children, className = '', align = 'left', ...props }) => (
  <td className={`px-5 py-4 text-${align} ${className}`} {...props}>{children}</td>
);

export const Tr = ({ children, className = '', hover = true, ...props }) => (
  <tr
    className={[hover ? 'hover:bg-surface-alt/60 transition-colors' : '', className].filter(Boolean).join(' ')}
    {...props}
  >
    {children}
  </tr>
);

export default Table;
