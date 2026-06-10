const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  return transporter;
}

/**
 * Send a contact form notification to the admin inbox.
 */
async function sendContactNotification({ name, email, subject, message }) {
  const to = process.env.MAIL_TO || process.env.MAIL_USER;
  if (!to) return;

  await getTransporter().sendMail({
    from: `"CivicClean Contact" <${process.env.MAIL_USER}>`,
    to,
    replyTo: email,
    subject: `[CivicClean] New message: ${subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#16a34a;margin-top:0;">New Contact Form Submission</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;font-weight:600;color:#374151;width:90px;">Name</td><td style="padding:8px 0;color:#111827;">${name}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600;color:#374151;">Email</td><td style="padding:8px 0;color:#111827;"><a href="mailto:${email}" style="color:#16a34a;">${email}</a></td></tr>
          <tr><td style="padding:8px 0;font-weight:600;color:#374151;">Subject</td><td style="padding:8px 0;color:#111827;">${subject}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
          <p style="margin:0;font-weight:600;color:#374151;margin-bottom:8px;">Message</p>
          <p style="margin:0;color:#374151;white-space:pre-wrap;">${message}</p>
        </div>
        <p style="margin-top:20px;font-size:12px;color:#9ca3af;">Sent from CivicClean contact form · Reply directly to respond to ${name}</p>
      </div>
    `,
  });
}

module.exports = { sendContactNotification };
