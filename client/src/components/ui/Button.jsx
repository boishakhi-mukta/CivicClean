import { forwardRef } from 'react';

const VARIANTS = {
  primary:       'bg-primary text-on-primary hover:bg-primary-hover focus-visible:ring-focus-ring',
  danger:        'bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger',
  success:       'bg-success text-white hover:bg-success/90 focus-visible:ring-success',
  outline:       'border border-border text-text hover:bg-surface-alt focus-visible:ring-focus-ring',
  ghost:         'text-text hover:bg-surface-alt focus-visible:ring-focus-ring',
  'ghost-danger':'text-danger hover:bg-danger/10 focus-visible:ring-danger',
  'soft-danger': 'bg-danger/10 text-danger hover:bg-danger/20 focus-visible:ring-danger',
  'soft-success':'bg-success/10 text-success hover:bg-success/20 focus-visible:ring-success',
  'soft-info':   'bg-info/10 text-info hover:bg-info/20 focus-visible:ring-info',
  'soft-warning':'bg-warning/10 text-warning hover:bg-warning/20 focus-visible:ring-warning',
};

const SIZES = {
  xs: 'px-2.5 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
  xl: 'px-8 py-4 text-lg gap-2.5',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  as: Tag = 'button',
  ...props
}, ref) => {
  const base = [
    'inline-flex items-center justify-center font-semibold rounded-lg',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'transition-colors duration-150',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    fullWidth ? 'w-full' : '',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    className,
  ].filter(Boolean).join(' ');

  const isDisabled = disabled || loading;

  return (
    <Tag ref={ref} className={base} disabled={Tag === 'button' ? isDisabled : undefined} aria-disabled={isDisabled} {...props}>
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && <span className="flex-shrink-0">{iconRight}</span>}
    </Tag>
  );
});

Button.displayName = 'Button';

export default Button;
