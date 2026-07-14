// ─────────────────────────────────────────────────────────────────────────────
// useLocalStorage.js — Works exactly like React's useState but saves the value
// to the browser's localStorage so it survives page refreshes and browser restarts.
//
// Usage:
//   const [theme, setTheme] = useLocalStorage('civicclean-theme', 'light');
//   // `theme` is 'light' on the first visit, then whatever the user last chose.
//   // setTheme('dark') saves 'dark' both to React state AND to localStorage.
//
// The value is serialised to JSON when stored and parsed back when retrieved,
// so it works with strings, numbers, objects, and arrays.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Try to read the previously saved value from the browser
      const item = window.localStorage.getItem(key);
      // If something was saved, parse and return it; otherwise use the default
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      // If reading fails for any reason, fall back to the initial value
      return initialValue;
    }
  });

  // setValue updates both the React state and the browser storage at the same time
  const setValue = useCallback((value) => {
    try {
      // Support the updater function pattern: setValue(prev => prev + 1)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.error(`useLocalStorage: failed to write key "${key}"`, err);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
