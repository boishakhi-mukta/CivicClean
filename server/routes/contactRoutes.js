// ─────────────────────────────────────────────────────────────────────────────
// routes/contactRoutes.js — Routes for contact form messages at /api/contact.
//
//   POST   /api/contact      — public; saves a new message and sends an email
//                              notification to the admin inbox.
//   GET    /api/contact      — no auth guard (admin-facing, but not locked in
//                              routes — the admin reads messages here).
//   PATCH  /api/contact/:id  — updates the status of a message (new → read →
//                              replied) so the admin can track which ones have
//                              been handled.
// ─────────────────────────────────────────────────────────────────────────────

const express      = require('express');
const router       = express.Router();
const contactCtrl  = require('../controllers/contactController');

router.post('/',     contactCtrl.createMessage);
router.get('/',      contactCtrl.getMessages);
router.patch('/:id', contactCtrl.updateStatus);

module.exports = router;
