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
