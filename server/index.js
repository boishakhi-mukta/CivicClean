// ─────────────────────────────────────────────────────────────────────────────
// index.js — The main entry point of the CivicClean backend server.
//
// This file does three things:
//   1. Sets up the Express web server with the middleware it needs (CORS so the
//      browser can talk to the API, JSON body parsing up to 10 MB for photos).
//   2. Connects to the MongoDB database via Mongoose. The connectDB function
//      checks if there is already an open connection before trying to open a
//      new one — this prevents duplicate connections on Vercel which re-uses
//      the same Node process across requests (serverless warm starts).
//   3. Registers all the API route groups under /api/*, then starts listening
//      on a port (locally) or exports the app for Vercel's serverless runtime.
//
// Special routes in this file (not in route modules):
//   GET /api/stats — returns platform-wide totals (users, issues, resolved,
//     total donations) used by the HomePage stats counter animation.
//   GET /health — a simple ping endpoint to check if the server is alive and
//     whether the database is connected. Useful for monitoring tools.
//
// The error handler middleware is added LAST intentionally — Express only
// routes unhandled errors to it if it is registered after all other middleware.
//
// SECURITY NOTE: MONGODB_URI and all Firebase credentials are loaded from
// environment variables (.env) and must NEVER be hardcoded in this file.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Allow cross-origin requests for deployment
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicclean', {
      serverSelectionTimeoutMS: 5000 // Add a timeout to fail fast if DB is unreachable
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Initialize connection
connectDB();

// Models for stats
const Issue = require('./models/Issue');
const Donation = require('./models/Donation');
const User = require('./models/User');

// API Routes
const issueRoutes = require('./routes/issueRoutes');
const donationRoutes = require('./routes/donationRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes  = require('./routes/paymentRoutes');
const contactRoutes  = require('./routes/contactRoutes');
const errorHandler   = require('./middlewares/errorHandler');

// Add a middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use('/api/issues',   issueRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact',  contactRoutes);

// GET /api/stats (Explicitly mapped as requested)
app.get('/api/stats', async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    
    // Calculate total unique users dynamically
    const totalUsers = await User.countDocuments();
    
    const totalContributionsAggregation = await Donation.aggregate([{ $group: { _id: null, totalAmount: { $sum: "$amount" } } }]);
    const totalContributions = totalContributionsAggregation.length > 0 ? totalContributionsAggregation[0].totalAmount : 0;
    
    res.json({
      totalUsers,
      issuesReported: totalIssues,
      issuesResolved: resolvedIssues,
      totalContributions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running normally',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send('CivicClean API is running');
});

// Start server if running locally (not in serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Centralised error handler — must be last middleware
app.use(errorHandler);

// Export for Vercel
module.exports = app;
