// ─────────────────────────────────────────────────────────────────────────────
// routes/donationRoutes.js — Handles community donation (contribution) records
// for /api/donations.
//
// Donations are the crowdfunding feature: citizens donate money toward the
// clean-up budget of a specific issue. These are separate from payments
// (which are for subscriptions and boosts).
//
// Routes:
//   GET  /api/donations — returns donations filtered by issueId and/or email.
//     • ?issueId=<id>   → all donations to that issue (used by IssueDetailPage
//                          to calculate the funding progress bar)
//     • ?email=<email>  → all donations by a citizen (used by MyContributionPage)
//     • No filter       → all donations (admin use)
//
//   POST /api/donations — creates a new donation record.
//     Requires issueId, amount, name, and email in the request body.
//     No auth token needed — donations are open to anyone (even guests).
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');

// GET /api/donations
router.get('/', async (req, res) => {
  try {
    const { issueId, email } = req.query;
    let query = {};
    if (issueId) query.issueId = issueId;
    if (email) query.email = email;
    
    const donations = await Donation.find(query).sort({ date: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/donations
router.post('/', async (req, res) => {
  try {
    const { issueId, amount, name, email } = req.body;
    if (!issueId || !amount || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const donation = new Donation(req.body);
    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
