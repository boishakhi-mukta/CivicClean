import { useState, useRef, useEffect, useCallback } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const Dropdown = ({
  trigger,
  children,
  align = 'left',
  width = 'w-48',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    const keyHandler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [open, close]);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div onClick={() => setOpen((v) => !v)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v); }}>
        {trigger}
      </div>
      {open && (
        <div
          className={[
            'absolute z-50 mt-2 py-1 bg-surface border border-border rounded-xl shadow-xl',
            width,
            align === 'right' ? 'right-0' : 'left-0',
          ].join(' ')}
          role="menu"
        >
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, onClick, className = '', danger = false, icon, ...props }) => (
  <button
    onClick={onClick}
    className={[
      'w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left',
      'hover:bg-surface-alt transition-colors',
      danger ? 'text-danger' : 'text-text',
      className,
    ].filter(Boolean).join(' ')}
    role="menuitem"
    {...props}
  >
    {icon && <span className="flex-shrink-0">{icon}</span>}
    {children}
  </button>
);

export const DropdownDivider = () => (
  <hr className="my-1 border-border" />
);

export const DropdownLabel = ({ children }) => (
  <div className="px-4 py-1.5 text-xs font-semibold text-muted uppercase tracking-wider">{children}</div>
);

export const SelectTrigger = ({ label, placeholder = 'Select…', className = '' }) => (
  <button
    className={[
      'flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border border-border',
      'bg-surface-alt text-text text-sm font-medium',
      'hover:bg-surface focus:outline-none focus:ring-2 focus:ring-focus-ring transition-colors',
      'min-w-[140px]',
      className,
    ].join(' ')}
    type="button"
  >
    <span className={label ? 'text-text' : 'text-muted/60'}>{label || placeholder}</span>
    <FiChevronDown size={16} className="flex-shrink-0 text-muted" />
  </button>
);

export default Dropdown;
