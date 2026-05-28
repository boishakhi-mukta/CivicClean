/**
 * One-time seed script: creates one admin and one staff user.
 * Run with: node scripts/seed-users.js
 * Safe to re-run — skips Firebase creation if email already exists.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const admin    = require('firebase-admin');
const mongoose = require('mongoose');
const User     = require('../models/User');

const USERS = [
  { name: 'CivicClean Admin', email: 'admin@civicclean.com',  password: 'Admin@123', role: 'admin'  },
  { name: 'CivicClean Staff', email: 'staff@civicclean.com',  password: 'Staff@123', role: 'staff'  },
];

// ── Firebase Admin init ──────────────────────────────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────
async function getOrCreateFirebaseUser(email, password, displayName) {
  try {
    return await admin.auth().getUserByEmail(email);
  } catch {
    return await admin.auth().createUser({ email, password, displayName });
  }
}

async function getOrCreateDbUser(firebaseUid, email, name, role) {
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role        = role;
    existing.firebase_uid = firebaseUid;
    await existing.save();
    return existing;
  }
  return User.create({ firebase_uid: firebaseUid, email, name, role });
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const results = [];

  for (const u of USERS) {
    const fbUser   = await getOrCreateFirebaseUser(u.email, u.password, u.name);
    const dbUser   = await getOrCreateDbUser(fbUser.uid, u.email, u.name, u.role);
    results.push({ role: u.role, email: u.email, password: u.password, mongoId: dbUser._id.toString() });
  }

  console.log('═══════════════════════════════════════════════');
  console.log('  Seed complete — user credentials');
  console.log('═══════════════════════════════════════════════');
  for (const r of results) {
    console.log(`\n  Role    : ${r.role}`);
    console.log(`  Email   : ${r.email}`);
    console.log(`  Password: ${r.password}`);
    console.log(`  Mongo ID: ${r.mongoId}`);
  }
  console.log('\n═══════════════════════════════════════════════');

  await mongoose.disconnect();
  process.exit(0);
})().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
