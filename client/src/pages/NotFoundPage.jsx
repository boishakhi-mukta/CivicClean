// ─────────────────────────────────────────────────────────────────────────────
// NotFoundPage.jsx — The 404 "page not found" screen.
//
// Shown whenever someone navigates to a URL that doesn't match any route in
// the app — for example typing the wrong address, or following a dead link.
//
// Keeps the layout simple: a large emoji, the "404" number, a plain-English
// explanation, and a button to go back to the homepage so the user isn't stuck.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Link } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';

const NotFoundPage = () => (
  <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center bg-bg transition-colors duration-200 px-4 text-center">
    <Fade direction="down" triggerOnce>
      <div className="text-8xl sm:text-9xl mb-4">🏜️</div>
      <h1 className="text-5xl sm:text-6xl font-extrabold text-text mb-4">404</h1>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text mb-6">
        Oops! Page not found.
      </h2>
      <p className="text-base sm:text-lg text-muted mb-10 max-w-md mx-auto leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="px-8 py-4 bg-primary text-on-primary font-bold rounded-lg shadow-lg hover:bg-primary-hover transition-colors text-lg"
      >
        Go Back Home
      </Link>
    </Fade>
  </div>
);

export default NotFoundPage;
