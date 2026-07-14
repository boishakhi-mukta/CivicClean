// ─────────────────────────────────────────────────────────────────────────────
// ScrollToTop.jsx — Automatically scrolls the page to the top on navigation.
//
// Without this, clicking a link in React would keep the scroll position from
// the previous page — so if you were halfway down the Explore page and clicked
// an issue card, the detail page would open halfway scrolled down instead of
// at the top.
//
// This component silently fixes that: every time the URL path changes it runs
// window.scrollTo(0, 0) to jump back to the very top.  It renders nothing
// visible on screen.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // pathname is the current URL path, e.g. "/explore" or "/explore/abc123"
  const { pathname } = useLocation();

  // Every time the path changes, scroll instantly to the top of the page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Nothing to render — this component exists purely for its side-effect
  return null;
};

export default ScrollToTop;
