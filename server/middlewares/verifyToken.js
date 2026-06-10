const { initFirebaseAdmin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const firebaseAdmin = initFirebaseAdmin();
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    req.user = { email: decoded.email, uid: decoded.uid };
    next();
  } catch (err) {
    if (err.message === 'Firebase Admin environment variables are missing.') {
      return res.status(500).json({ message: err.message });
    }
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = verifyToken;
