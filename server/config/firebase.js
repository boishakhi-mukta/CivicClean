const admin = require('firebase-admin');

/**
 * Initialises Firebase Admin SDK once, using environment variables.
 * Safe to call multiple times — returns the existing app if already initialised.
 */
const initFirebaseAdmin = () => {
  if (admin.apps.length) return admin;

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error('Firebase Admin environment variables are missing.');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      // .env stores the key with literal \n — restore actual newlines
      privateKey:  FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });

  return admin;
};

module.exports = { initFirebaseAdmin };
