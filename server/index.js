const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Allow cross-origin requests for deployment
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Add a middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use('/api/issues', issueRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// GET /api/stats (Explicitly mapped as requested)
app.get('/api/stats', async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });
    const pendingIssues = await Issue.countDocuments({ status: 'Open' }) + await Issue.countDocuments({ status: 'In Progress' });
    
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

// Export for Vercel
module.exports = app;
