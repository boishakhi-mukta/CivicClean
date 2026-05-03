const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Contribution = require('../models/Contribution');

// GET /api/users/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const users = await User.find().sort({ total_points: -1 }).limit(limit);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id/contributions
router.get('/:id/contributions', async (req, res) => {
  try {
    const contributions = await Contribution.find({ userId: req.params.id })
      .populate('issueId', 'title')
      .sort({ created_at: -1 });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
