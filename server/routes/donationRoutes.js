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
