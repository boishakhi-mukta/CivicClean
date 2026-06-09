import { useTheme } from '../context/ThemeContext';
import { HiSun, HiMoon, HiComputerDesktop } from 'react-icons/hi2';

const OPTIONS = [
  { value: 'light',  Icon: HiSun,             label: 'Light'  },
  { value: 'system', Icon: HiComputerDesktop,  label: 'System' },
  { value: 'dark',   Icon: HiMoon,             label: 'Dark'   },
];

const ThemeToggle = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Color scheme"
      className={`inline-flex rounded-lg border border-border bg-surface-alt p-0.5 gap-0.5 ${className}`}
    >
      {OPTIONS.map(({ value, Icon, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            aria-pressed={active}
            aria-label={`${label} mode`}
            title={`${label} mode`}
            className={`
              flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium
              transition-colors duration-150 focus:outline-none focus-visible:ring-2
              focus-visible:ring-focus-ring focus-visible:ring-offset-1
              ${active
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-muted hover:text-text hover:bg-surface'}
            `}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
