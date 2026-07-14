// ─────────────────────────────────────────────────────────────────────────────
// models/Contribution.js — The MongoDB schema for a leaderboard contribution
// point event.
//
// This model tracks civic actions that earn citizens points on the leaderboard
// (the /leaderboard page). Each document is a single point-earning event:
//   "Reported Issue" — citizen submitted a new issue
//   "Resolved Issue" — a citizen's issue was resolved (added by staff/admin)
//   "Upvoted Issue"  — citizen upvoted another citizen's issue
//
// The points field stores how many leaderboard points this action is worth.
//
// Note: Do not confuse this with Donation.js (which is also named
// "contributionSchema" internally). This model uses the Mongoose model name
// "Contribution" and stores activity points, not money.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  points: Number,
  action: {
    type: String,
    enum: ['Reported Issue', 'Resolved Issue', 'Upvoted Issue']
  },
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contribution', contributionSchema);
