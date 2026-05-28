const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const User = require('../models/User');
const Contribution = require('../models/Contribution');
const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');
const verifyStaff = require('../middlewares/verifyStaff');

// Helper to award points (legacy — kept for backward compatibility)
const awardPoints = async (userId, points, action, issueId) => {
  if (!userId) return;
  try {
    const contribution = new Contribution({ userId, points, action, issueId });
    await contribution.save();
    await User.findByIdAndUpdate(userId, { $inc: { total_points: points } });
  } catch (error) {
    console.error('Failed to award points:', error);
  }
};

const VALID_STATUSES = ['pending', 'in-progress', 'working', 'resolved', 'closed', 'rejected'];

// ── GET /api/issues ───────────────────────────────────────────────────────────
// Supports: ?search= ?category= ?status= ?priority= ?email= ?reported_by=
//           ?page= ?limit=  (default page=1, limit=10)
// Always sorts boosted issues first: { isBoosted: -1, date: -1 }
router.get('/', async (req, res) => {
  try {
    const { category, status, priority, search, email, reported_by, assignedStaffEmail } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const query = {};
    if (category)           query.category                    = category;
    if (status)             query.status                      = status;
    if (priority)           query.priority                    = priority;
    if (email)              query.email                       = email;
    if (reported_by)        query.reported_by                 = reported_by;
    if (assignedStaffEmail) query['assignedStaff.staffEmail'] = assignedStaffEmail;
    if (search) {
      query.$or = [
        { title:    { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('reported_by', 'name avatar_url total_points')
        .sort({ isBoosted: -1, date: -1 })
        .skip(skip)
        .limit(limit),
      Issue.countDocuments(query)
    ]);

    res.json({
      issues,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/issues/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reported_by', 'name avatar_url total_points');
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/issues ──────────────────────────────────────────────────────────
// Requires auth. Adds initial timeline entry on creation.
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, category, reported_by } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const issue = new Issue({
      ...req.body,
      timeline: [
        {
          message:   'Issue reported by citizen',
          updatedBy: req.user.email,
          role:      'citizen',
          status:    'pending',
          createdAt: new Date()
        }
      ]
    });

    await issue.save();

    // Legacy gamification — award 10 points for reporting
    if (reported_by) {
      await awardPoints(reported_by, 10, 'Reported Issue', issue._id);
    }

    res.status(201).json(issue);
  } catch (error) {
    console.error('Failed to create issue:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/issues/:id/status (legacy) ──────────────────────────────────────
router.put('/:id/status', async (req, res) => {
  try {
    const { status, userId } = req.body;

    const validStatuses = ['Open', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const wasResolved = issue.status === 'Resolved';
    issue.status = status;
    await issue.save();

    if (status === 'Resolved' && !wasResolved && userId) {
      await awardPoints(userId, 20, 'Resolved Issue', issue._id);
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/issues/:id/upvote (legacy) ─────────────────────────────────────
router.post('/:id/upvote', async (req, res) => {
  try {
    const { userId } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    issue.upvotes = (issue.upvotes || 0) + 1;
    await issue.save();

    if (userId) {
      await awardPoints(userId, 5, 'Upvoted Issue', issue._id);
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/issues/:id ───────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (issue.email && issue.email !== req.body.email) {
      return res.status(403).json({ error: 'Unauthorized to edit this issue' });
    }
    if (issue.reported_by && req.body.reported_by &&
        issue.reported_by.toString() !== req.body.reported_by) {
      return res.status(403).json({ error: 'Unauthorized to edit this issue' });
    }

    Object.assign(issue, req.body);
    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/issues/:id ────────────────────────────────────────────────────
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

// ── PATCH /api/issues/:id/upvote ─────────────────────────────────────────────
router.patch('/:id/upvote', verifyToken, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (issue.email === req.user.email) {
      return res.status(403).json({ message: 'Cannot upvote your own issue' });
    }

    if (issue.upvotes.includes(req.user.email)) {
      return res.status(400).json({ message: 'Already upvoted' });
    }

    issue.upvotes.push(req.user.email);
    issue.upvoteCount = (issue.upvoteCount || 0) + 1;
    await issue.save();

    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PATCH /api/issues/:id/assign ─────────────────────────────────────────────
router.patch('/:id/assign', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { staffId, staffName, staffEmail } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (issue.assignedStaff && issue.assignedStaff.staffId) {
      return res.status(400).json({ message: 'Staff already assigned' });
    }

    issue.assignedStaff = { staffId, staffName, staffEmail };
    issue.timeline.push({
      message:   `Issue assigned to Staff: ${staffName}`,
      updatedBy: req.user.email,
      role:      'admin',
      status:    issue.status,
      createdAt: new Date()
    });

    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PATCH /api/issues/:id/status ─────────────────────────────────────────────
router.patch('/:id/status', verifyToken, verifyStaff, async (req, res) => {
  try {
    const { status, message } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    issue.status = status;
    issue.timeline.push({
      message:   message || `Status updated to ${status}`,
      updatedBy: req.user.email,
      role:      'staff',
      status,
      createdAt: new Date()
    });

    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PATCH /api/issues/:id/reject ─────────────────────────────────────────────
router.patch('/:id/reject', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { reason } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    issue.status         = 'rejected';
    issue.rejectedReason = reason;
    issue.timeline.push({
      message:   `Issue rejected by admin. Reason: ${reason}`,
      updatedBy: req.user.email,
      role:      'admin',
      status:    'rejected',
      createdAt: new Date()
    });

    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
