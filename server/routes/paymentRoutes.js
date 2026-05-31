const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Issue   = require('../models/Issue');
const User    = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');

// ── GET /api/payments/mine ────────────────────────────────────────────────────
// Must be defined before GET / to avoid route-order ambiguity
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ userEmail: req.user.email })
      .sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/payments ─────────────────────────────────────────────────────────
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type } : {};

    const [payments, total] = await Promise.all([
      Payment.find(query).sort({ date: -1 }),
      Payment.countDocuments(query)
    ]);

    res.json({ payments, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/payments ────────────────────────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const { amount, type, issueId, issueTitle, paymentMethod } = req.body;

    if (!amount || !type) {
      return res.status(400).json({ message: 'amount and type are required' });
    }

    if (!['boost', 'subscription'].includes(type)) {
      return res.status(400).json({ message: 'Invalid payment type' });
    }

    if (paymentMethod && !['mobile-banking', 'card', 'bank-transfer'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const transactionId =
      'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    let issue = null;
    let user = null;

    if (type === 'boost') {
      issue = await Issue.findById(issueId);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found for boost' });
      }
      if (issue.isBoosted) {
        return res.status(409).json({ message: 'This issue is already boosted.' });
      }
    }

    if (type === 'subscription') {
      user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found for subscription' });
      }
      if (user.isPremium) {
        return res.status(409).json({ message: 'User is already premium' });
      }
    }

    const payment = new Payment({
      userEmail: req.user.email,
      amount,
      type,
      paymentMethod,
      issueId,
      issueTitle,
      transactionId
    });

    await payment.save();

    if (type === 'boost') {
      const timelineEntry = {
        message:   'Issue priority boosted to High via payment',
        updatedBy: req.user.email,
        role:      'citizen',
        status:    issue.status,
        createdAt: new Date()
      };
      await Issue.findByIdAndUpdate(
        issueId,
        { $set: { isBoosted: true, priority: 'high' }, $push: { timeline: timelineEntry } }
      );
    }

    if (type === 'subscription') {
      await User.findByIdAndUpdate(user._id, { $set: { isPremium: true, role: 'citizen' } });
    }

    res.status(201).json({ success: true, payment, transactionId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
