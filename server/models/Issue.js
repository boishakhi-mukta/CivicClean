const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'] 
  },
  location: String,
  description: String,
  image: String,
  amount: Number,
  email: String,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'working', 'resolved', 'closed', 'rejected'],
    default: 'pending'
  },
  reported_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  upvotes: {
    type: [String],
    default: []
  },
  upvoteCount: {
    type: Number,
    default: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isBoosted: {
    type: Boolean,
    default: false
  },
  assignedStaff: {
    staffId: String,
    staffName: String,
    staffEmail: String
  },
  timeline: [{
    message: String,
    updatedBy: String,
    role: String,
    status: String,
    createdAt: { type: Date, default: Date.now }
  }],
  rejectedReason: { type: String },
  date: { type: Date, default: Date.now }
});

// Normalize legacy priority values before validation
issueSchema.pre('validate', function () {
  if (this.priority === 'normal') this.priority = 'medium';
});

module.exports = mongoose.model('Issue', issueSchema);
