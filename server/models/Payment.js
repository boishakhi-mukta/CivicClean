const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['boost', 'subscription'], required: true },
  paymentMethod: {
    type: String,
    enum: ['mobile-banking', 'card', 'bank-transfer'],
  },
  issueId: { type: String },
  issueTitle: { type: String },
  transactionId: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
