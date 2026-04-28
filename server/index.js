const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// The React client runs on port 3000
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicclean')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models for stats
const Issue = require('./models/Issue');
const Contribution = require('./models/Contribution');

// API Routes
const issueRoutes = require('./routes/issueRoutes');
const contributionRoutes = require('./routes/contributionRoutes');

app.use('/api/issues', issueRoutes);
app.use('/api/contributions', contributionRoutes);

// GET /api/stats (Explicitly mapped as requested)
app.get('/api/stats', async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    const pendingIssues = await Issue.countDocuments({ status: 'ongoing' });
    
    // Calculate total unique users dynamically
    const issueEmails = await Issue.distinct('email');
    const contributionEmails = await Contribution.distinct('email');
    const uniqueUsers = new Set([...issueEmails, ...contributionEmails]);
    
    res.json({
      totalUsers: uniqueUsers.size,
      totalIssues,
      resolvedIssues,
      pendingIssues
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running normally' });
});

// Basic route
app.get('/', (req, res) => {
  res.send('CivicClean API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
