const express = require('express');
const router = express.Router();
const Contribution = require('../models/Contribution');

// GET /api/contributions
router.get('/', async (req, res) => {
  try {
    const { email, issueId } = req.query;
    let query = {};
    if (email) query.email = email;
    if (issueId) query.issueId = issueId;
    
    const contributions = await Contribution.find(query).sort({ date: -1 });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/contributions
router.post('/', async (req, res) => {
  try {
    const { issueId, amount, email } = req.body;
    if (!issueId || !amount || !email) {
      return res.status(400).json({ error: 'issueId, amount, and email are required' });
    }
    const contribution = new Contribution(req.body);
    await contribution.save();
    res.status(201).json(contribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
