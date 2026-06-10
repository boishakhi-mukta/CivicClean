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
