// ─────────────────────────────────────────────────────────────────────────────
// controllers/issueController.js — All the business logic for issue operations.
//
// Each exported function handles one specific API action. The route file
// (issueRoutes.js) maps HTTP methods + URLs to these functions.
//
// getIssues — the most complex function. Builds a dynamic MongoDB query from
//   up to 6 optional query parameters (category, status, priority, search,
//   email, assignedStaffEmail). The search parameter does a case-insensitive
//   regex match on title, category, and location simultaneously.
//   Results are sorted so boosted issues always appear first (isBoosted: -1),
//   then by newest date (-1). Paginated with page + limit query params.
//   LEGACY_STATUS_MAP handles old status strings (e.g. "Open" → "pending")
//   that may have been stored by earlier versions of the app.
//
// createIssue — checks two guards before saving:
//   1. isBlocked — blocked citizens cannot report issues.
//   2. Free plan limit — free citizens are capped at 3 issues (issueCount >= 3
//      and not isPremium). If the limit is reached, returns 403.
//   Automatically adds the first timeline entry ("Issue reported by citizen").
//
// updateIssue — lets the reporter edit their own issue. Verifies ownership by
//   matching the email or reported_by ID from the request body against the
//   stored issue values before allowing changes.
//
// deleteIssue — same ownership check as updateIssue before deleting.
//
// upvoteIssue — prevents self-upvoting (can't upvote your own issue) and
//   duplicate upvoting (email already in upvotes array).
//
// assignIssue — admin-only. Sets assignedStaff and adds a timeline entry.
//   Returns 400 if staff is already assigned.
//
// updateIssueStatus — staff-only. Validates the new status is in VALID_STATUSES,
//   then updates status and pushes a timeline entry.
//
// rejectIssue — admin-only. Sets status to "rejected", saves the reason text,
//   and pushes a timeline entry with the reason.
// ─────────────────────────────────────────────────────────────────────────────

const Issue = require('../models/Issue');
const User  = require('../models/User');

const VALID_STATUSES = ['pending', 'in-progress', 'working', 'resolved', 'closed', 'rejected'];

const LEGACY_STATUS_MAP = {
  Open:          'pending',
  'In Progress': 'in-progress',
  Resolved:      'resolved',
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ── GET /api/issues ── */
exports.getIssues = async (req, res, next) => {
  try {
    const { category, status, priority, search, email, reported_by, assignedStaffEmail } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const query = {};
    if (category)           query.category                    = { $regex: new RegExp(`^${escapeRegex(category)}$`, 'i') };
    if (priority)           query.priority                    = { $regex: new RegExp(`^${escapeRegex(priority)}$`, 'i') };
    if (email)              query.email                       = email;
    if (reported_by)        query.reported_by                 = reported_by;
    if (assignedStaffEmail) query['assignedStaff.staffEmail'] = assignedStaffEmail;

    if (status) {
      const legacyEquivalents = Object.entries(LEGACY_STATUS_MAP)
        .filter(([, v]) => v === status)
        .map(([k]) => k);
      query.status = legacyEquivalents.length > 0
        ? { $in: [status, ...legacyEquivalents] }
        : { $regex: new RegExp(`^${escapeRegex(status)}$`, 'i') };
    }

    if (search) {
      query.$and = [
        ...(query.$and || []),
        { $or: [
          { title:    { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ]},
      ];
    }

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('reported_by', 'name avatar_url')
        .sort({ isBoosted: -1, date: -1 })
        .skip(skip)
        .limit(limit),
      Issue.countDocuments(query),
    ]);

    res.json({ issues, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/issues/:id ── */
exports.getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('reported_by', 'name avatar_url');
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/issues ── */
exports.createIssue = async (req, res, next) => {
  try {
    const { title, category } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const user = await User.findOne({ email: req.user.email });
    if (user?.isBlocked) {
      return res.status(403).json({ error: 'Your account has been blocked. Contact admin.' });
    }
    if (user && !user.isPremium && (user.issueCount ?? 0) >= 3) {
      return res.status(403).json({ error: 'Free account limit reached. Upgrade to Premium.' });
    }

    const issue = new Issue({
      ...req.body,
      timeline: [{
        message:   'Issue reported by citizen',
        updatedBy: req.user.email,
        role:      'citizen',
        status:    'pending',
        createdAt: new Date(),
      }],
    });

    await issue.save();
    res.status(201).json(issue);
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/issues/:id ── */
exports.updateIssue = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /api/issues/:id ── */
exports.deleteIssue = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/issues/:id/upvote ── */
exports.upvoteIssue = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/issues/:id/assign ── */
exports.assignIssue = async (req, res, next) => {
  try {
    const { staffId, staffName, staffEmail } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    if (issue.assignedStaff?.staffId) {
      return res.status(400).json({ message: 'Staff already assigned' });
    }
    const timelineEntry = {
      message:   `Issue assigned to Staff: ${staffName}`,
      updatedBy: req.user.email,
      role:      'admin',
      status:    issue.status,
      createdAt: new Date(),
    };
    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { $set: { assignedStaff: { staffId, staffName, staffEmail } }, $push: { timeline: timelineEntry } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/issues/:id/status ── */
exports.updateIssueStatus = async (req, res, next) => {
  try {
    const { status, message } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    const timelineEntry = {
      message:   message || `Status updated to ${status}`,
      updatedBy: req.user.email,
      role:      'staff',
      status,
      createdAt: new Date(),
    };
    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { $set: { status }, $push: { timeline: timelineEntry } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/issues/:id/reject ── */
exports.rejectIssue = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    const timelineEntry = {
      message:   `Issue rejected by admin. Reason: ${reason}`,
      updatedBy: req.user.email,
      role:      'admin',
      status:    'rejected',
      createdAt: new Date(),
    };
    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'rejected', rejectedReason: reason }, $push: { timeline: timelineEntry } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
