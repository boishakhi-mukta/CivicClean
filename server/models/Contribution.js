const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  issueId: { type: String, required: true },
  issueTitle: String,
  amount: Number,
  name: String,
  email: String,
  phone: String,
  address: String,
  date: { type: Date, default: Date.now },
  additionalInfo: String
});

module.exports = mongoose.model('Contribution', contributionSchema);
