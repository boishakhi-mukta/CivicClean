// ─────────────────────────────────────────────────────────────────────────────
// models/User.js — The MongoDB schema (blueprint) for a user account.
//
// Every person who registers on CivicClean gets one document in the "users"
// collection that follows this shape. The schema covers all three roles:
// citizens, staff members, and the admin.
//
// Key fields explained:
//   firebase_uid — the unique ID issued by Firebase when a user signs up.
//     The backend uses this to link the Firebase Auth account to the MongoDB
//     document. Required and unique so one Firebase account = one DB record.
//
//   role — "citizen" (default), "staff", or "admin". Controls what pages and
//     API endpoints the user can access.
//
//   isBlocked — if true, the citizen cannot submit new issues. The admin sets
//     this via the Manage Users page.
//
//   isPremium — if true, the citizen has no issue-reporting limit (normally
//     capped at 3 for free accounts). Set to true when a subscription payment
//     is confirmed.
//
//   issueCount — tracks how many issues a free-plan citizen has submitted.
//     Incremented by the /increment-count endpoint after each successful report.
//
//   tNumber — optional phone/contact number stored as a string.
//
// Pre-validate hook:
//   Normalises legacy role values that were stored before the role naming
//   convention was finalised (e.g. "User" → "citizen", "Admin" → "admin").
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebase_uid: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatar_url: String,
  role: {
    type: String,
    enum: ['citizen', 'staff', 'admin'],
    default: 'citizen'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  issueCount: {
    type: Number,
    default: 0
  },
  tNumber: {
    type: String,
    trim: true,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Normalize legacy role values (e.g. 'User' → 'citizen') before validation
userSchema.pre('validate', function () {
  const ROLE_MAP = { User: 'citizen', user: 'citizen', Admin: 'admin', Staff: 'staff' };
  if (this.role && ROLE_MAP[this.role]) this.role = ROLE_MAP[this.role];
});

module.exports = mongoose.model('User', userSchema);
