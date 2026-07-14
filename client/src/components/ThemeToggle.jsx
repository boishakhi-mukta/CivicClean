// ─────────────────────────────────────────────────────────────────────────────
// ThemeToggle.jsx — Button that switches between light mode and dark mode.
//
// When dark mode is active it shows a sun icon ☀️ (click to go light).
// When light mode is active it shows a moon icon 🌙 (click to go dark).
//
// The user's preference is saved to the browser so it is remembered the next
// time they visit the site.  The actual theme state lives in ThemeContext and
// this component simply reads and toggles it.
// ─────────────────────────────────────────────────────────────────────────────

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
      {/* Show the sun when dark (to offer switching to light), moon when light */}
      {isDarkMode
        ? <HiSun  className="h-5 w-5" aria-hidden="true" />
        : <HiMoon className="h-5 w-5" aria-hidden="true" />
      }
    </button>
  );
};

export default ThemeToggle;
