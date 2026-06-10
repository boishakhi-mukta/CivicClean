import { useState, useCallback } from 'react';

/**
 * Like useState but persists the value in localStorage under `key`.
 * Reads the initial value from storage; falls back to `initialValue` if absent.
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.error(`useLocalStorage: failed to write key "${key}"`, err);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
