import { forwardRef } from 'react';

const baseClass =
  'w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-text ' +
  'placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-focus-ring ' +
  'transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

const readonlyClass =
  'w-full px-4 py-2.5 rounded-lg border border-transparent bg-border/20 text-muted ' +
  'cursor-not-allowed outline-none';

const errorClass = 'border-danger focus:ring-danger focus:border-danger';

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
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
});

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

Input.displayName = 'Input';
Textarea.displayName = 'Textarea';
Select.displayName = 'Select';

export default Input;
