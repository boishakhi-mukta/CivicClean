const Contact = require('../models/Contact');
const { sendContactNotification } = require('../utils/mailer');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── POST /api/contact ── */
exports.createMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const contact = new Contact({ name, email, subject, message });
    await contact.save();

    // Fire-and-forget — don't block the response if email fails
    sendContactNotification({ name, email, subject, message }).catch(() => {});

    res.status(201).json({ message: 'Message received. We will get back to you soon!' });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/contact ── */
exports.getMessages = async (_req, res, next) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();
    res.json({ messages, total: messages.length });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/contact/:id ── */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Message not found.' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
