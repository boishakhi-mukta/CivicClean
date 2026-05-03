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
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open' 
  },
  reported_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  upvotes: {
    type: Number,
    default: 0
  },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', issueSchema);
