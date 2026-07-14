// ─────────────────────────────────────────────────────────────────────────────
// ThemeContext.jsx — Manages light mode / dark mode for the whole site.
//
// How it works:
//   1. When the site first loads, it checks if the user previously chose a theme
//      (saved in the browser's localStorage).
//   2. If there is no saved preference, it uses the device/OS setting
//      (system dark mode on macOS, Windows, iOS, Android, etc.).
//   3. The chosen theme is applied by toggling a "dark" CSS class on the root
//      <html> element — Tailwind's dark mode feature reads this class.
//   4. Every time the user clicks the moon/sun button, the theme flips and the
//      new choice is saved to localStorage so it persists across browser sessions.
//
// Components access this via:
//   const { isDarkMode, toggleDarkMode } = useTheme();
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";

export const ThemeContext = createContext();

// Key used to read/write the preference in the browser's localStorage
const STORAGE_KEY = "civicclean-theme";

export const ThemeProvider = ({ children }) => {
  // Initialise with the stored preference, falling back to the OS setting
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
    // No saved preference — follow the operating system's dark mode setting
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Every time isDarkMode changes, update the CSS class and save to storage
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem(STORAGE_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Flips between dark and light
  const toggleDarkMode = () => setIsDarkMode((v) => !v);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Convenience hook so components can write `useTheme()` instead of
// `useContext(ThemeContext)` every time
export const useTheme = () => useContext(ThemeContext);
