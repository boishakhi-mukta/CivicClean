// ─────────────────────────────────────────────────────────────────────────────
// middlewares/verifyToken.js — Checks that a valid Firebase login token is
// attached to incoming API requests.
//
// When the React frontend makes a protected API call, it attaches the user's
// Firebase ID token in the request header like this:
//   Authorization: Bearer <token>
//
// This middleware:
//   1. Reads the Authorization header.
//   2. Extracts the token (the part after "Bearer ").
//   3. Asks Firebase Admin to verify the token — Firebase checks the signature
//      and expiry date. If the token is valid, Firebase returns the user's
//      email and UID.
//   4. Saves the email and UID to req.user so the next handler (the controller
//      or another middleware like verifyAdmin) can use them.
//   5. If there is no token or it is invalid, returns HTTP 401 Unauthorized.
//
// This middleware is used on any route that requires the user to be logged in.
// ─────────────────────────────────────────────────────────────────────────────

const { initFirebaseAdmin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const firebaseAdmin = initFirebaseAdmin();
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    req.user = { email: decoded.email, uid: decoded.uid };
    next();
  } catch (err) {
    if (err.message === 'Firebase Admin environment variables are missing.') {
      return res.status(500).json({ message: err.message });
    }
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = verifyToken;
