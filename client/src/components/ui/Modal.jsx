// ─────────────────────────────────────────────────────────────────────────────
// Modal.jsx — A generic pop-up dialog used across the app.
//
// Features:
//   • Renders nothing at all when `isOpen` is false (zero performance cost).
//   • Shows a dark overlay behind the box; clicking the overlay closes the modal
//     (unless `closeOnOverlay={false}` is set — useful for forms where accidental
//     dismissal would lose the user's work).
//   • Pressing the Escape key also closes it.
//   • The page behind the modal becomes un-scrollable while it is open, so the
//     user can't accidentally scroll the page while interacting with the modal.
//   • Scrollable internally — long content (like a long form) will scroll inside
//     the modal box rather than making it grow off-screen.
//
// Props:
//   isOpen         — true = visible, false = hidden
//   onClose        — called when the user dismisses the modal
//   title          — heading shown at the top; also used as the accessible label
//   footer         — optional bottom bar (typically Cancel / Save buttons)
//   size           — "sm" | "md" | "lg" | "xl" | "2xl" | "full"
//   closeOnOverlay — whether clicking the dark backdrop closes the modal (default true)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useCallback } from 'react';
import { FiX } from 'react-icons/fi';

// Maximum width for each size option
const SIZES = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  '2xl':'max-w-2xl',
  full: 'max-w-full mx-4',
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  className = '',
}) => {
  // Close the modal when Escape is pressed
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKey);
    // Prevent the page from scrolling behind the modal
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = ''; // restore scrolling when modal closes
    };
  }, [isOpen, handleKey]);

  // Render nothing if the modal is not open — keeps the DOM clean
  if (!isOpen) return null;

  return (
    // Dark semi-transparent backdrop covering the whole screen
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/50"
      onClick={closeOnOverlay ? (e) => { if (e.target === e.currentTarget) onClose?.(); } : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* The white modal box — clicks here do NOT bubble up to close the backdrop */}
      <div
        className={[
          'bg-surface rounded-2xl shadow-2xl w-full flex flex-col',
          'max-h-[90vh]', // never taller than 90% of the screen height
          SIZES[size] ?? SIZES.md,
          className,
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: title on the left, X close button on the right */}
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
            {title && <h2 className="text-lg font-bold text-text">{title}</h2>}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-alt transition-colors ml-auto"
                aria-label="Close modal"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        )}

        {/* Scrollable body — long content scrolls here, not the whole page */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Optional sticky footer (e.g. Cancel / Save buttons) */}
        {footer && (
          <div className="px-6 py-4 border-t border-border flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
