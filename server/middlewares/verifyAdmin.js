// ─────────────────────────────────────────────────────────────────────────────
// middlewares/verifyAdmin.js — Checks that the logged-in user is an admin.
//
// This middleware must always be placed AFTER verifyToken in a route definition
// because it reads req.user.email, which verifyToken sets.
//
// It looks up the user in MongoDB by their email. If the user document exists
// and their role is "admin", the request is allowed through. Otherwise the
// server responds with HTTP 403 Forbidden.
//
// Example route usage:
//   router.get('/', verifyToken, verifyAdmin, adminController.getAll);
//
// This two-step approach (verifyToken first, then verifyAdmin) is intentional:
// verifyToken ensures we know WHO is asking; verifyAdmin ensures they have the
// right ROLE to do what they are asking.
// ─────────────────────────────────────────────────────────────────────────────

const User = require('../models/User');

// Must be used AFTER verifyToken — relies on req.user.email being set
const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = verifyAdmin;
