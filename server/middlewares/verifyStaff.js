// ─────────────────────────────────────────────────────────────────────────────
// middlewares/verifyStaff.js — Checks that the logged-in user is a staff
// member OR an admin.
//
// Admins are also allowed through this middleware because admins have a superset
// of staff permissions — if a staff member can do something, the admin can too.
//
// Like verifyAdmin, this must always be placed AFTER verifyToken in a route.
// It reads req.user.email (set by verifyToken), looks up the user in MongoDB,
// and rejects with HTTP 403 if their role is neither "staff" nor "admin".
//
// Used on routes like:
//   PATCH /api/issues/:id/status — only staff (or admin) can update status
// ─────────────────────────────────────────────────────────────────────────────

const User = require('../models/User');

// Must be used AFTER verifyToken — relies on req.user.email being set
const verifyStaff = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Forbidden: Staff only' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = verifyStaff;
