const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const Contribution = require('../models/Contribution');

// GET /api/issues
router.get('/', async (req, res) => {
  try {
    const { limit, category, status, search } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    let issuesQuery = Issue.find(query).sort({ date: -1 });
    if (limit) issuesQuery = issuesQuery.limit(parseInt(limit));
    
    const issues = await issuesQuery;
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/issues/:id
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/issues
router.post('/', async (req, res) => {
  try {
    const { title, category, email } = req.body;
    if (!title || !category || !email) {
      return res.status(400).json({ error: 'Title, category, and email are required' });
    }
    
    const issue = new Issue(req.body);
    await issue.save();
    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/issues/:id
router.put('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    
    // Check email matches (basic security)
    if (issue.email !== req.body.email) {
      return res.status(403).json({ error: 'Unauthorized to edit this issue' });
    }

    Object.assign(issue, req.body);
    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/issues/:id
router.delete('/:id', async (req, res) => {
  try {
    const { email } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    
    if (issue.email !== email) {
      return res.status(403).json({ error: 'Unauthorized to delete this issue' });
    }

    await issue.deleteOne();
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
