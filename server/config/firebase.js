// ─────────────────────────────────────────────────────────────────────────────
// config/firebase.js — Initialises the Firebase Admin SDK for server-side use.
//
// The Firebase Admin SDK is the server-side version of Firebase. It lets the
// backend verify Firebase ID tokens (JWTs) that the browser sends in the
// Authorization header. This is how the server knows which user is making a
// request without managing its own sessions or passwords.
//
// initFirebaseAdmin():
//   Checks if Firebase has already been initialised (admin.apps.length > 0)
//   before calling initializeApp(). This guard is important on Vercel where the
//   same Node process may handle many requests in sequence — calling initializeApp
//   twice would throw an error.
//
//   The credentials come from three environment variables:
//     FIREBASE_PROJECT_ID     — your Firebase project name
//     FIREBASE_CLIENT_EMAIL   — the service account email
//     FIREBASE_PRIVATE_KEY    — the private key (stored with literal \n in .env;
//                               the .replace() call restores real newlines)
//
// SECURITY NOTE: These three values are secret. They must stay in .env and
// never be committed to version control.
// ─────────────────────────────────────────────────────────────────────────────

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
