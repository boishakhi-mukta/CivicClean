// ─────────────────────────────────────────────────────────────────────────────
// models/Contact.js — The MongoDB schema for contact form submissions.
//
// When a visitor fills in the Contact page form and clicks "Send Message", the
// submission is saved to this collection. This lets the admin read and respond
// to messages without relying solely on email delivery (which could fail).
//
// Key fields:
//   name / email / subject / message — the four fields from the contact form.
//     All are required. Email is lowercased and trimmed. Message is capped at
//     3,000 characters to prevent abuse.
//
//   status — tracks whether the admin has acted on the message:
//     "new"     — just received, not yet read
//     "read"    — admin has seen it
//     "replied" — admin has responded
//
// timestamps: true adds createdAt and updatedAt fields automatically, so the
// admin can sort messages by when they arrived.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true, maxlength: 100 },
    email:   { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    status:  { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);
