import { HiSun, HiMoon } from 'react-icons/hi2';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        p-2 rounded-lg text-muted
        hover:bg-surface-alt transition-colors duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
        ${className}
      `}
    >
      {isDarkMode
        ? <HiSun  className="h-5 w-5" aria-hidden="true" />
        : <HiMoon className="h-5 w-5" aria-hidden="true" />
      }
    </button>
  );
};

export default ThemeToggle;
