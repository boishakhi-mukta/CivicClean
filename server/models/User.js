const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebase_uid: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatar_url: String,
  role: {
    type: String,
    enum: ['citizen', 'staff', 'admin'],
    default: 'citizen'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  issueCount: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Normalize legacy role values (e.g. 'User' → 'citizen') before validation
userSchema.pre('validate', function () {
  const ROLE_MAP = { User: 'citizen', user: 'citizen', Admin: 'admin', Staff: 'staff' };
  if (this.role && ROLE_MAP[this.role]) this.role = ROLE_MAP[this.role];
});

module.exports = mongoose.model('User', userSchema);
