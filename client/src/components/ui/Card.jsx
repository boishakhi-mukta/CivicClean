const PADDING = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

const Card = ({ children, className = '', padding = 'md', flat = false, as: Tag = 'div', ...props }) => {
  const base = [
    'bg-surface rounded-xl border border-border',
    flat ? '' : 'shadow-sm',
    PADDING[padding] ?? PADDING.md,
    className,
  ].filter(Boolean).join(' ');

  return <Tag className={base} {...props}>{children}</Tag>;
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`pb-4 mb-4 border-b border-border ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', as: Tag = 'h2', ...props }) => (
  <Tag className={`text-lg font-bold text-text ${className}`} {...props}>{children}</Tag>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`pt-4 mt-4 border-t border-border ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
