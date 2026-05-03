const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  points: Number,
  action: {
    type: String,
    enum: ['Reported Issue', 'Resolved Issue', 'Upvoted Issue']
  },
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contribution', contributionSchema);
