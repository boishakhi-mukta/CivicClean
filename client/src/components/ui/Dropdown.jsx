// ─────────────────────────────────────────────────────────────────────────────
// Dropdown.jsx — A generic dropdown menu that opens when its trigger is clicked.
//
// The dropdown closes when:
//   • The user clicks anywhere outside it.
//   • The user presses the Escape key.
//   • A menu item calls the `close()` function passed to it.
//
// Exports:
//   Dropdown       — the container.  Wrap your trigger element and menu items in it.
//                    Props: trigger (the clickable element), align ("left"|"right"),
//                    width (Tailwind width class e.g. "w-48").
//                    Children can be a render function receiving `{ close }` so
//                    individual items can close the menu after they run their action.
//
//   DropdownItem   — a single clickable row inside the dropdown.
//                    Set `danger={true}` to colour the text red (destructive actions).
//                    Pass `icon` to show an icon on the left.
//
//   DropdownDivider — a thin horizontal line to separate groups of items.
//
//   DropdownLabel   — a small, non-clickable section heading inside the menu.
//
//   SelectTrigger   — a pre-styled button that looks like a native <select> element,
//                     used when you want to replace the browser's default dropdown
//                     with a custom-styled one.
// ─────────────────────────────────────────────────────────────────────────────

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

  // Close the dropdown when clicking outside or pressing Escape
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
      {/* Clicking or pressing Enter/Space on the trigger toggles the menu */}
      <div
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v); }}
      >
        {trigger}
      </div>

      {/* The floating menu panel — only rendered when open */}
      {open && (
        <div
          className={[
            'absolute z-50 mt-2 py-1 bg-surface border border-border rounded-xl shadow-xl',
            width,
            align === 'right' ? 'right-0' : 'left-0', // align to right or left edge
          ].join(' ')}
          role="menu"
        >
          {/* Allow children to be a function so they can call close() themselves */}
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  );
};

// A single clickable option inside the dropdown
export const DropdownItem = ({ children, onClick, className = '', danger = false, icon, ...props }) => (
  <button
    onClick={onClick}
    className={[
      'w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left',
      'hover:bg-surface-alt transition-colors',
      danger ? 'text-danger' : 'text-text', // red text for destructive actions
      className,
    ].filter(Boolean).join(' ')}
    role="menuitem"
    {...props}
  >
    {icon && <span className="flex-shrink-0">{icon}</span>}
    {children}
  </button>
);

// Thin horizontal rule to visually group menu items
export const DropdownDivider = () => (
  <hr className="my-1 border-border" />
);

// Non-clickable section label above a group of items
export const DropdownLabel = ({ children }) => (
  <div className="px-4 py-1.5 text-xs font-semibold text-muted uppercase tracking-wider">{children}</div>
);

// Pre-styled trigger button that mimics a native select input with a chevron arrow
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
    {/* Show placeholder text in muted colour when nothing is selected yet */}
    <span className={label ? 'text-text' : 'text-muted/60'}>{label || placeholder}</span>
    <FiChevronDown size={16} className="flex-shrink-0 text-muted" />
  </button>
);

export default Dropdown;
