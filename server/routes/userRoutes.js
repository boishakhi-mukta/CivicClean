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
