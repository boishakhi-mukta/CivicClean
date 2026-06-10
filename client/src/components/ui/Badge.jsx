import { getStatusConfig } from '../../constants/statusConfig';

const VARIANT_CLASSES = {
  default: 'bg-muted/10 text-muted',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger:  'bg-danger/10 text-danger',
  info:    'bg-info/10 text-info',
};

const SIZES = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

const Badge = ({ children, variant = 'default', size = 'sm', dot = false, className = '', ...props }) => {
  const base = [
    'inline-flex items-center gap-1.5 font-semibold rounded-full',
    VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default,
    SIZES[size] ?? SIZES.sm,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={base} {...props}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full bg-current flex-shrink-0`} />}
      {children}
    </span>
  );
};

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
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default Badge;
