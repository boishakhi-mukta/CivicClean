// ─────────────────────────────────────────────────────────────────────────────
// controllers/userController.js — Business logic for user account operations.
//
// upsertUser — called every time a user logs in. Finds the existing MongoDB
//   document by email and updates it if name/avatar changed, or creates a new
//   citizen document if this is the user's first login. The "manual:" prefix
//   on firebase_uid is used as a placeholder when a user was created manually
//   in the database before linking their Firebase account.
//
// createStaff — admin-only. Creates both the Firebase Auth account AND the
//   MongoDB document for a new staff member:
//   1. Tries to create a Firebase user with the given email/password.
//   2. If the email already exists in Firebase, fetches the existing UID.
//   3. Finds or creates the MongoDB document with role="staff".
//   The dual creation is needed because login requires Firebase, but role/profile
//   data is stored in MongoDB.
//
// getUsers — admin-only. Returns citizens only by default (excludes admin and
//   staff), unless a specific role is passed in the query string.
//
// incrementIssueCount — called by the frontend AFTER a successful issue
//   submission. Uses $inc to atomically add 1 to issueCount so there are no
//   race conditions if a user submits two issues quickly.
//
// toggleBlock — flips the isBlocked boolean. Reads the current value first
//   and sends the opposite, so one endpoint handles both blocking and unblocking.
//
// updateProfile — allows a user to update their own name, avatar_url, and
//   tNumber. If the request comes from a different user, it checks whether the
//   requestor is an admin (admins can update anyone's profile).
// ─────────────────────────────────────────────────────────────────────────────

const User = require('../models/User');

/* ── POST /api/users — upsert user on first login ── */
exports.upsertUser = async (req, res, next) => {
  try {
    const { firebase_uid, email, name, avatar_url } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existing = await User.findOne({ email });
    if (existing) {
      let changed = false;
      if (firebase_uid && (!existing.firebase_uid || existing.firebase_uid.startsWith('manual:'))) {
        existing.firebase_uid = firebase_uid; changed = true;
      }
      if (name && !existing.name)               { existing.name       = name;       changed = true; }
      if (avatar_url && !existing.avatar_url)   { existing.avatar_url = avatar_url; changed = true; }
      if (changed) await existing.save();
      return res.status(200).json(existing);
    }

    const user = new User({
      firebase_uid: firebase_uid || `manual:${email}`,
      email,
      name:       name       || '',
      avatar_url: avatar_url || '',
      role: 'citizen',
    });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/users/create-staff ── */
exports.createStaff = async (req, res, next) => {
  try {
    const firebaseAdmin = require('firebase-admin');
    const { name, email, password, avatar_url } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let firebase_uid;
    try {
      const created = await firebaseAdmin.auth().createUser({ email, password, displayName: name || '' });
      firebase_uid = created.uid;
    } catch (fbErr) {
      if (fbErr.code === 'auth/email-already-exists') {
        const existing = await firebaseAdmin.auth().getUserByEmail(email);
        firebase_uid = existing.uid;
      } else {
        return res.status(400).json({ message: fbErr.message });
      }
    }

    let dbUser = await User.findOne({ email });
    if (dbUser) {
      dbUser.firebase_uid = firebase_uid;
      dbUser.role = 'staff';
      if (name && !dbUser.name) dbUser.name = name;
      if (avatar_url) dbUser.avatar_url = avatar_url;
      await dbUser.save();
    } else {
      dbUser = await User.create({ firebase_uid, email, name: name || '', avatar_url: avatar_url || '', role: 'staff' });
    }
    res.status(201).json(dbUser);
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/users/me ── */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/users/staff ── */
exports.getStaff = async (_req, res, next) => {
  try {
    const staff = await User.find({ role: 'staff' });
    res.json(staff);
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/users ── */
exports.getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = role && role !== 'citizen'
      ? { role }
      : { role: { $nin: ['admin', 'staff'] } };
    const users = await User.find(query).sort({ _id: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/users/increment-count ── */
exports.incrementIssueCount = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { $inc: { issueCount: 1 } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/users/:id ── */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/users/:id/block ── */
exports.toggleBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isBlocked: !user.isBlocked } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/users/:id/role ── */
exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['citizen', 'staff', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be citizen, staff, or admin' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /api/users/:id ── */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User removed from database' });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/users/:id — update profile (name, avatar_url, tNumber) ── */
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.email !== req.user.email) {
      const requestor = await User.findOne({ email: req.user.email });
      if (!requestor || requestor.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: You can only update your own profile' });
      }
    }

    const { name, avatar_url, tNumber } = req.body;
    const updates = {};
    if (name       !== undefined) updates.name       = name;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (tNumber    !== undefined) updates.tNumber    = tNumber;

    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
