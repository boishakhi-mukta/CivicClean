// ─────────────────────────────────────────────────────────────────────────────
// models/Issue.js — The MongoDB schema for a civic issue report.
//
// An "issue" is the core data object of CivicClean — everything else (payments,
// donations, staff assignments) revolves around it.
//
// Key fields explained:
//   title / category / location / description — the core content filled in by
//     the citizen when reporting an issue.
//
//   image — a URL to the uploaded photo (Firebase Storage or base64 fallback).
//
//   amount — the citizen's suggested clean-up budget in Norwegian kroner (kr).
//
//   email — the reporter's email, used to match issues to their owner since the
//     frontend often queries by email rather than MongoDB _id.
//
//   status — the pipeline stage the issue is in. Valid values:
//     pending → in-progress → working → resolved (normal flow)
//     closed / rejected (terminal states set by admin)
//
//   upvotes — an array of email strings. Each email can only appear once,
//     preventing the same user from upvoting twice. upvoteCount mirrors
//     the array length for quick sorting.
//
//   priority — low / medium (default) / high. Citizens set this on creation;
//     it is bumped to "high" automatically when an issue is boosted.
//
//   isBoosted — true if the citizen paid 99 kr to boost this issue. Boosted
//     issues are sorted first in the All Issues list and highlighted in staff
//     dashboards.
//
//   assignedStaff — embeds the staff member's id, name, and email directly
//     on the issue document so a simple find() can filter by staffEmail
//     without a join.
//
//   timeline — an array of log entries recording every status change, assignment,
//     and boost. Each entry has a message, who made the change, their role, the
//     resulting status, and a timestamp. Displayed as the IssueTimeline component
//     on the frontend.
//
//   rejectedReason — the text reason typed by the admin when rejecting an issue.
//
// Pre-validate hook:
//   Normalises the legacy priority value "normal" to "medium".
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'] 
  },
  location: String,
  description: String,
  image: String,
  amount: Number,
  email: String,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'working', 'resolved', 'closed', 'rejected'],
    default: 'pending'
  },
  reported_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  upvotes: {
    type: [String],
    default: []
  },
  upvoteCount: {
    type: Number,
    default: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isBoosted: {
    type: Boolean,
    default: false
  },
  assignedStaff: {
    staffId: String,
    staffName: String,
    staffEmail: String
  },
  timeline: [{
    message: String,
    updatedBy: String,
    role: String,
    status: String,
    createdAt: { type: Date, default: Date.now }
  }],
  rejectedReason: { type: String },
  date: { type: Date, default: Date.now }
});

// Normalize legacy priority values before validation
issueSchema.pre('validate', function () {
  if (this.priority === 'normal') this.priority = 'medium';
});

module.exports = mongoose.model('Issue', issueSchema);
