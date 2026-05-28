const User = require('../models/User');

// Must be used AFTER verifyToken — relies on req.user.email being set
const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = verifyAdmin;
