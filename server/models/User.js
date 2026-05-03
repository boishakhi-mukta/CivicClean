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
    enum: ['User', 'Admin'],
    default: 'User'
  },
  total_points: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
