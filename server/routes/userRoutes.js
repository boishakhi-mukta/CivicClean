const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');

// POST /api/users — save new user on first login (no auth required)
router.post('/', async (req, res) => {
  try {
    const { firebase_uid, email, name, avatar_url } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Return existing user — never create duplicates
    const existing = await User.findOne({ email });
    if (existing) {
      let changed = false;
      // Replace a manual: placeholder with the real Firebase UID when the user registers
      if (firebase_uid && (!existing.firebase_uid || existing.firebase_uid.startsWith('manual:'))) {
        existing.firebase_uid = firebase_uid;
        changed = true;
      }
      if (name && !existing.name) {
        existing.name = name;
        changed = true;
      }
      if (avatar_url && !existing.avatar_url) {
        existing.avatar_url = avatar_url;
        changed = true;
      }
      if (changed) await existing.save();
      return res.status(200).json(existing);
    }

    const user = new User({
      firebase_uid: firebase_uid || `manual:${email}`,
      email,
      name: name || '',
      avatar_url: avatar_url || '',
      role: 'citizen'
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Specific POST routes ──────────────────────────────────────────────────────

// POST /api/users/create-staff — create Firebase auth account + DB user with staff role (admin only)
router.post('/create-staff', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const firebaseAdmin = require('firebase-admin');
    const { name, email, password, avatar_url } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let firebase_uid;
    let existingFbUser = null;

    // Try to create a new Firebase auth account
    try {
      const created = await firebaseAdmin.auth().createUser({
        email,
        password,
        displayName: name || '',
      });
      firebase_uid = created.uid;
    } catch (fbError) {
      if (fbError.code === 'auth/email-already-exists') {
        // Firebase account already exists — look up its UID and reuse it
        existingFbUser = await firebaseAdmin.auth().getUserByEmail(email);
        firebase_uid = existingFbUser.uid;
      } else {
        return res.status(400).json({ message: fbError.message });
      }
    }

    // Create or update the DB record
    let dbUser = await User.findOne({ email });
    if (dbUser) {
      dbUser.firebase_uid = firebase_uid;
      dbUser.role = 'staff';
      if (name && !dbUser.name) dbUser.name = name;
      if (avatar_url) dbUser.avatar_url = avatar_url;
      await dbUser.save();
    } else {
      dbUser = await User.create({
        firebase_uid,
        email,
        name: name || '',
        avatar_url: avatar_url || '',
        role: 'staff',
      });
    }

    res.status(201).json(dbUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Specific GET routes must come BEFORE /:id ────────────────────────────────

// GET /api/users/me — get current user by email (auth required)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/staff — get all staff users (admin only)
router.get('/staff', verifyToken, verifyAdmin, async (_req, res) => {
  try {
    const staff = await User.find({ role: 'staff' });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users — citizens only (admin only); ?role= overrides
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { role } = req.query;
    // When filtering for citizens, also include users with no role field (pre-migration documents)
    const query = role && role !== 'citizen'
      ? { role }
      : { role: { $nin: ['admin', 'staff'] } };
    const users = await User.find(query).sort({ _id: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Specific PATCH routes must come BEFORE /:id ──────────────────────────────

// PATCH /api/users/increment-count — increment issueCount for current user
router.patch('/increment-count', verifyToken, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { $inc: { issueCount: 1 } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Parameterised routes ─────────────────────────────────────────────────────

// GET /api/users/:id — get user by MongoDB _id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/users/:id/block — toggle isBlocked (admin only)
router.patch('/:id/block', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isBlocked: !user.isBlocked } },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/users/:id/role — update role (admin only)
router.patch('/:id/role', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['citizen', 'staff', 'admin'];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be citizen, staff, or admin' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/users/:id — remove user from DB (admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User removed from database' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/users/:id — update profile (name and avatar_url); admin can update any user
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.email !== req.user.email) {
      const requestor = await User.findOne({ email: req.user.email });
      if (!requestor || requestor.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: You can only update your own profile' });
      }
    }

    const { name, avatar_url } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
