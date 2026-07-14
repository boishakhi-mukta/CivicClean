// ─────────────────────────────────────────────────────────────────────────────
// routes/authRoutes.js — Handles the initial user registration/sync route.
//
// POST /api/auth/verify:
//   Called by the React frontend right after a successful Firebase login
//   (whether email/password or Google). The frontend sends the user's Firebase
//   UID, email, name, and avatar URL.
//
//   The server finds or creates the matching MongoDB document:
//     • If no document exists for this UID → creates a new citizen account.
//     • If a document exists → updates the name/avatar if they have changed
//       (e.g. the user updated their Google profile photo).
//
//   This "upsert on login" pattern keeps the MongoDB user record in sync with
//   Firebase Auth without requiring a separate registration step.
//
//   The route does NOT require a Firebase token header because at this point
//   the user has just logged in and we trust the UID passed in the request body
//   (the real security gate is Firebase Auth on the client side).
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const { uid, email, name, avatar_url } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: 'UID and email are required' });
    }

    // Find user or create if it doesn't exist
    let user = await User.findOne({ firebase_uid: uid });

    if (!user) {
      // Create new user
      user = new User({
        firebase_uid: uid,
        email,
        name: name || '',
        avatar_url: avatar_url || ''
      });
      await user.save();
    } else {
      // Update existing user details if they changed
      if (name && user.name !== name) user.name = name;
      if (avatar_url && user.avatar_url !== avatar_url) user.avatar_url = avatar_url;
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
