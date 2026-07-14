// ─────────────────────────────────────────────────────────────────────────────
// models/Donation.js — The MongoDB schema for a citizen's financial donation
// toward a specific issue's clean-up fund.
//
// A "donation" is different from a "payment":
//   Payments (Payment.js) are for platform features (subscription, boost).
//   Donations are community crowdfunding — any user can chip in money toward
//   the clean-up budget of any open issue.
//
// Note: the Mongoose model name is "Donation" but the collection and the schema
// variable are named "contributionSchema". This is for historical reasons —
// the feature was originally called "contributions" in the codebase before
// being renamed. The ContributionModal frontend component still references this
// via the /donations endpoint.
//
// Key fields:
//   issueId / issueTitle — which issue this donation is funding.
//   amount — the donation amount in kr.
//   name / email / phone / address — the donor's contact details, pre-filled
//     from their profile in ContributionModal.
//   additionalInfo — optional free-text note from the donor.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  issueId: { type: String, required: true },
  issueTitle: String,
  amount: Number,
  name: String,
  email: String,
  phone: String,
  address: String,
  date: { type: Date, default: Date.now },
  additionalInfo: String
});

module.exports = mongoose.model('Donation', contributionSchema);
