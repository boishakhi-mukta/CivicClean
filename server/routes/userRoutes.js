// ─────────────────────────────────────────────────────────────────────────────
// routes/userRoutes.js — Defines all HTTP routes for /api/users/*.
//
// Route summary:
//   POST   /api/users                   — public; upsert user on first login
//   POST   /api/users/create-staff      — admin only; create a staff account
//   GET    /api/users/me                — logged in; get own profile
//   GET    /api/users/staff             — admin only; list all staff
//   GET    /api/users                   — admin only; list citizens (or by role)
//   PATCH  /api/users/increment-count   — logged in; bump issue submission count
//   GET    /api/users/:id               — public; get user by MongoDB ID
//   PATCH  /api/users/:id/block         — admin only; toggle citizen block
//   PATCH  /api/users/:id/role          — admin only; change user role
//   DELETE /api/users/:id               — admin only; remove user from DB
//   PATCH  /api/users/:id               — logged in; update own profile
//
// Route ordering note:
//   Specific string paths (/me, /staff, /increment-count) are registered BEFORE
//   the parameterised path (/:id) to prevent Express from matching "me" or
//   "staff" as an ID.
// ─────────────────────────────────────────────────────────────────────────────

const express     = require('express');
const router      = express.Router();
const userCtrl    = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');

// ── Specific POST routes ───────────────────────────────────────────────────
router.post('/',              userCtrl.upsertUser);
router.post('/create-staff',  verifyToken, verifyAdmin, userCtrl.createStaff);

// ── Specific GET routes (must come BEFORE /:id) ───────────────────────────
router.get('/me',    verifyToken,              userCtrl.getMe);
router.get('/staff', verifyToken, verifyAdmin, userCtrl.getStaff);
router.get('/',      verifyToken, verifyAdmin, userCtrl.getUsers);

// ── Specific PATCH routes (must come BEFORE /:id) ─────────────────────────
router.patch('/increment-count', verifyToken, userCtrl.incrementIssueCount);

// ── Parameterised routes ──────────────────────────────────────────────────
router.get('/:id',          userCtrl.getUserById);
router.patch('/:id/block',  verifyToken, verifyAdmin, userCtrl.toggleBlock);
router.patch('/:id/role',   verifyToken, verifyAdmin, userCtrl.updateRole);
router.delete('/:id',       verifyToken, verifyAdmin, userCtrl.deleteUser);
router.patch('/:id',        verifyToken,              userCtrl.updateProfile);

module.exports = router;
