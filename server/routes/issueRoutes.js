// ─────────────────────────────────────────────────────────────────────────────
// routes/issueRoutes.js — Defines all HTTP routes for /api/issues/*.
//
// This file maps URL patterns to controller functions and applies the right
// authentication/authorisation middleware to each route.
//
// Route summary:
//   GET    /api/issues          — public; list issues with optional filters
//   GET    /api/issues/:id      — public; get one issue by ID
//   POST   /api/issues          — logged in; create a new issue
//   PUT    /api/issues/:id      — no auth check (owner verified in controller)
//   DELETE /api/issues/:id      — no auth check (owner verified in controller)
//   PATCH  /api/issues/:id/upvote  — logged in; upvote an issue
//   PATCH  /api/issues/:id/assign  — admin only; assign to a staff member
//   PATCH  /api/issues/:id/status  — staff or admin; advance status pipeline
//   PATCH  /api/issues/:id/reject  — admin only; reject with a reason
//
// Legacy routes (kept for backwards compatibility):
//   PUT    /api/issues/:id/status — old clients used PUT instead of PATCH
//   POST   /api/issues/:id/upvote — old clients used POST instead of PATCH
//
// Route ordering matters in Express: more specific paths (like /assigned) must
// be defined before parameterised paths (like /:id) so Express doesn't treat
// "assigned" as an ID value.
// ─────────────────────────────────────────────────────────────────────────────

const express      = require('express');
const router       = express.Router();
const issueCtrl    = require('../controllers/issueController');
const verifyToken  = require('../middlewares/verifyToken');
const verifyAdmin  = require('../middlewares/verifyAdmin');
const verifyStaff  = require('../middlewares/verifyStaff');

const Issue = require('../models/Issue');

// ── Public / basic routes ──────────────────────────────────────────────────
router.get('/',     issueCtrl.getIssues);
router.get('/:id',  issueCtrl.getIssueById);

// ── Auth-protected write routes ────────────────────────────────────────────
router.post('/',    verifyToken,               issueCtrl.createIssue);
router.put('/:id',                             issueCtrl.updateIssue);
router.delete('/:id',                          issueCtrl.deleteIssue);

// ── Status / interaction routes ────────────────────────────────────────────
router.patch('/:id/upvote', verifyToken,                        issueCtrl.upvoteIssue);
router.patch('/:id/assign', verifyToken, verifyAdmin,           issueCtrl.assignIssue);
router.patch('/:id/status', verifyToken, verifyStaff,           issueCtrl.updateIssueStatus);
router.patch('/:id/reject', verifyToken, verifyAdmin,           issueCtrl.rejectIssue);

// ── Legacy routes (keep for backwards compat) ──────────────────────────────
const VALID_STATUSES    = ['pending', 'in-progress', 'working', 'resolved', 'closed', 'rejected'];
const LEGACY_STATUS_MAP = { Open: 'pending', 'In Progress': 'in-progress', Resolved: 'resolved' };

router.put('/:id/status', async (req, res, next) => {
  try {
    const status = LEGACY_STATUS_MAP[req.body.status] || req.body.status;
    if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    issue.status = status;
    await issue.save();
    res.json(issue);
  } catch (err) { next(err); }
});

router.post('/:id/upvote', async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    issue.upvotes = (issue.upvotes || 0) + 1;
    await issue.save();
    res.json(issue);
  } catch (err) { next(err); }
});

// ── GET /api/issues/assigned — issues assigned to current staff ────────────
router.get('/assigned', verifyToken, async (req, res, next) => {
  try {
    const issues = await Issue.find({ 'assignedStaff.staffEmail': req.user.email })
      .sort({ isBoosted: -1, date: -1 });
    res.json({ issues });
  } catch (err) { next(err); }
});

module.exports = router;
