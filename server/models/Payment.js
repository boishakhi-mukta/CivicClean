// ─────────────────────────────────────────────────────────────────────────────
// models/Payment.js — The MongoDB schema for a payment transaction.
//
// CivicClean has two types of payments, both stored in this collection:
//
//   "subscription" — a one-time 1,000 kr payment by a citizen to upgrade from
//     the free plan (3 issues max) to Premium (unlimited issues). On success,
//     the citizen's isPremium flag is set to true in the User collection.
//
//   "boost" — a one-time 99 kr payment by a citizen to boost a specific issue.
//     On success, the issue's isBoosted flag is set to true and its priority
//     is raised to "high", sorting it to the top of the All Issues list.
//
// Key fields:
//   userEmail — the payer's email (taken from their Firebase token, not user
//     input, so it cannot be faked).
//   transactionId — a unique ID generated at payment time (TXN-timestamp-random).
//     Used as a reference number on PDF invoices downloaded by the admin.
//   issueId / issueTitle — only populated for "boost" payments so the invoice
//     can show which issue was boosted.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['boost', 'subscription'], required: true },
  paymentMethod: {
    type: String,
    enum: ['mobile-banking', 'card', 'bank-transfer'],
  },
  issueId: { type: String },
  issueTitle: { type: String },
  transactionId: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
