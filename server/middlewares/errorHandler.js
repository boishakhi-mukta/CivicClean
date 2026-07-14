// ─────────────────────────────────────────────────────────────────────────────
// middlewares/errorHandler.js — A single catch-all error handler for the
// entire Express app.
//
// In Express, if a controller calls next(err) with an error object, Express
// skips all remaining regular middleware and jumps straight to any middleware
// that takes FOUR arguments (err, req, res, next) — that is this function.
//
// Why centralise error handling here?
//   Without this, every controller would need its own try/catch + res.status()
//   block to handle unexpected failures. With this, controllers can just call
//   next(err) and know they will get a consistent JSON error response.
//
// The handler:
//   • Logs the error with a timestamp and the HTTP method + URL for debugging.
//   • Reads the status code from the error object if it was set (e.g. a 404
//     thrown intentionally), or defaults to 500 Internal Server Error.
//   • Responds with { error: "message" } JSON so the frontend can display it.
//
// It must be registered LAST in index.js — after all routes — otherwise Express
// won't recognise it as an error handler and errors will go unhandled.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Centralised error-handling middleware.
 * Must be registered LAST in index.js (after all routes).
 * Route/controller code can call next(err) to reach this handler.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} — ${err.stack || err.message}`);

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
