const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const ipLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entries = (ipLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (entries.length >= RATE_LIMIT_MAX) {
    ipLog.set(ip, entries);
    return true;
  }
  entries.push(now);
  ipLog.set(ip, entries);
  return false;
}

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTENTS = new Set(['meetup', 'sponsor', 'both']);

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

router.post('/apply-to-host', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
    }

    const { name, email, city, intent, topic, message } = req.body || {};

    if (!name || !email || !city || !intent || !topic || !message) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }
    if (!INTENTS.has(intent)) {
      return res.status(400).json({ error: 'Invalid intent.' });
    }
    if (String(message).length > 2000) {
      return res.status(400).json({ error: 'Message too long (max 2000 chars).' });
    }

    const t = getTransporter();
    const to = process.env.CONTACT_TO_EMAIL || 'devanshu.saxena@tigergraph.com';
    if (!t) {
      console.error('❌ SMTP transporter unavailable — check SMTP_HOST/SMTP_USER/SMTP_PASS env vars');
      return res.status(500).json({ error: 'Email service not configured.' });
    }

    const intentLabel =
      intent === 'meetup' ? 'Host a meetup' : intent === 'sponsor' ? 'Sponsor DevHub' : 'Meetup + Sponsor';

    const subject = `[DevHub] Apply to Host — ${name} (${city})`;
    const textBody = [
      `New "Apply to Host" submission`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      `City: ${city}`,
      `Applying for: ${intentLabel}`,
      `Topic: ${topic}`,
      ``,
      `Message:`,
      message,
      ``,
      `— Sent from DevHub (ip: ${ip})`,
    ].join('\n');

    const htmlBody = `
      <div style="font-family:Inter,system-ui,sans-serif;color:#1a1a1a;max-width:560px">
        <h2 style="margin:0 0 16px 0;font-weight:600">New "Apply to Host" submission</h2>
        <table cellpadding="6" style="border-collapse:collapse;font-size:14px">
          <tr><td style="color:#888">Name</td><td>${esc(name)}</td></tr>
          <tr><td style="color:#888">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
          <tr><td style="color:#888">City</td><td>${esc(city)}</td></tr>
          <tr><td style="color:#888">Applying for</td><td>${esc(intentLabel)}</td></tr>
          <tr><td style="color:#888">Topic</td><td>${esc(topic)}</td></tr>
        </table>
        <h3 style="margin:20px 0 6px 0;font-size:14px;color:#888;font-weight:500">Message</h3>
        <div style="white-space:pre-wrap;border-left:3px solid #f2994a;padding:8px 14px;background:#fafafa;font-size:14px;line-height:1.5">${esc(message)}</div>
        <p style="color:#aaa;font-size:12px;margin-top:24px">Sent from DevHub · ip: ${esc(ip)}</p>
      </div>
    `;

    await t.sendMail({
      from: `"DevHub" <${process.env.SMTP_USER}>`,
      to,
      replyTo: email,
      subject,
      text: textBody,
      html: htmlBody,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('❌ /contact/apply-to-host failed:', err);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
});

module.exports = router;
