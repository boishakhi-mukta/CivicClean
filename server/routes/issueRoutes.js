const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const User = require('../models/User');
const Contribution = require('../models/Contribution');

// Helper to award points
const awardPoints = async (userId, points, action, issueId) => {
  if (!userId) return;
  try {
    // Add contribution record
    const contribution = new Contribution({
      userId,
      points,
      action,
      issueId
    });
    await contribution.save();

    // Increment user points
    await User.findByIdAndUpdate(userId, { $inc: { total_points: points } });
  } catch (error) {
    console.error('Failed to award points:', error);
  }
};

// GET /api/issues
router.get('/', async (req, res) => {
  try {
    const { limit, category, status, search, email, reported_by } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (email) query.email = email;
    if (reported_by) query.reported_by = reported_by;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    let issuesQuery = Issue.find(query)
      .populate('reported_by', 'name avatar_url total_points')
      .sort({ date: -1 });
      
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
    const issue = await Issue.findById(req.params.id).populate('reported_by', 'name avatar_url total_points');
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/issues
router.post('/', async (req, res) => {
  try {
    const { title, category, email, reported_by } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }
    
    const issue = new Issue(req.body);
    await issue.save();

    // Award 10 points for reporting an issue
    if (reported_by) {
      await awardPoints(reported_by, 10, 'Reported Issue', issue._id);
    }

    res.status(201).json(issue);
  } catch (error) {
    console.error('Failed to create issue:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/issues/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, userId } = req.body; // userId of person changing status (could be admin)
    
    const validStatuses = ['Open', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    
    const wasResolved = issue.status === 'Resolved';
    issue.status = status;
    await issue.save();

    // Award 20 points if newly resolved
    if (status === 'Resolved' && !wasResolved && userId) {
      await awardPoints(userId, 20, 'Resolved Issue', issue._id);
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/issues/:id/upvote
router.post('/:id/upvote', async (req, res) => {
  try {
    const { userId } = req.body; // user who upvoted
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    issue.upvotes = (issue.upvotes || 0) + 1;
    await issue.save();

    // Award 5 points for upvoting
    if (userId) {
      await awardPoints(userId, 5, 'Upvoted Issue', issue._id);
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/issues/:id
router.put('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    
    // Check email or reported_by matches
    if (issue.email && issue.email !== req.body.email) {
      return res.status(403).json({ error: 'Unauthorized to edit this issue' });
    }
    if (issue.reported_by && req.body.reported_by && issue.reported_by.toString() !== req.body.reported_by) {
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
    const { email, reported_by } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    
    if (issue.email && issue.email !== email) {
      return res.status(403).json({ error: 'Unauthorized to delete this issue' });
    }
    if (issue.reported_by && issue.reported_by.toString() !== reported_by) {
      return res.status(403).json({ error: 'Unauthorized to delete this issue' });
    }

    await issue.deleteOne();
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
