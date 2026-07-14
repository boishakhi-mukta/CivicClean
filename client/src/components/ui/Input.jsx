// ─────────────────────────────────────────────────────────────────────────────
// Input.jsx — Reusable form field components (text input, textarea, select).
//
// Why share them?  Every form field in the app needs a label, an error message,
// and consistent styling.  These components handle all of that in one place.
//
// Exports:
//   Input     — a single-line text field.
//   Textarea  — a multi-line text area (e.g. issue description).
//   Select    — a dropdown selector (e.g. category picker).
//
// All three support:
//   label     — text displayed above the field.
//   error     — red error message shown below the field on validation failure.
//   hint      — grey helper text shown below the field when there is no error.
//   required  — adds a red asterisk (*) to the label.
//   readOnly  — greys out the field so the user cannot type in it.
// ─────────────────────────────────────────────────────────────────────────────

import { forwardRef } from 'react';

// Normal editable field — blue focus ring when clicked
const baseClass =
  'w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-text ' +
  'placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-focus-ring ' +
  'transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

// Read-only field — greyed out, no border, no cursor
const readonlyClass =
  'w-full px-4 py-2.5 rounded-lg border border-transparent bg-border/20 text-muted ' +
  'cursor-not-allowed outline-none';

// Extra class applied when the field has a validation error — red border
const errorClass = 'border-danger focus:ring-danger focus:border-danger';

// ── Single-line text input ────────────────────────────────────────────────────
export const Input = forwardRef(({
  label,
  error,
  hint,
  id,
  className = '',
  readOnly,
  required,
  ...props
}, ref) => {
  // Auto-generate an id from the label if one is not provided
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const classes = [
    readOnly ? readonlyClass : baseClass,
    !readOnly && error ? errorClass : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-text">
          {label}{required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <input ref={ref} id={inputId} readOnly={readOnly} className={classes} {...props} />
      {/* Show error message in red, or hint text in grey (not both at once) */}
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
});

// ── Multi-line textarea ───────────────────────────────────────────────────────
export const Textarea = forwardRef(({
  label,
  error,
  hint,
  id,
  className = '',
  rows = 4,
  required,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-text">
          {label}{required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      {/* resize-none prevents the user from dragging the corner to resize the box */}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={[baseClass, 'resize-none', error ? errorClass : '', className].filter(Boolean).join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
});

// ── Dropdown select ───────────────────────────────────────────────────────────
export const Select = forwardRef(({
  label,
  error,
  hint,
  id,
  className = '',
  children,
  required,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-text">
          {label}{required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className={[baseClass, error ? errorClass : '', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
});

// Display names help debugging tools (React DevTools) show the right component name
Input.displayName = 'Input';
Textarea.displayName = 'Textarea';
Select.displayName = 'Select';

export default Input;
