// ─────────────────────────────────────────────────────────────────────────────
// useDebounce.js — Delays updating a value until the user has stopped changing it.
//
// The classic use case is a search box: without debouncing, every single
// keystroke would fire a network request to the server.  With debouncing,
// we wait until the user has paused typing for `delay` milliseconds before
// treating the value as "final" and sending the request.
//
// Example:
//   const debouncedSearch = useDebounce(searchText, 400);
//   // debouncedSearch only updates 400ms after the user stops typing.
//   // Use debouncedSearch in your API call instead of searchText directly.
//
// If the value changes again before the delay is up, the timer resets —
// so rapid changes only produce one update at the end.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Schedule an update after `delay` ms
    const timer = setTimeout(() => setDebounced(value), delay);

    // If value changes before the timer fires, cancel the old timer and start a new one
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
