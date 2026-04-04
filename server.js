import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Email transport configuration
//
// Render Free: outbound SMTP (ports 25/465/587) is blocked — connections time out (ETIMEDOUT CONN).
// See: https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports
// Fix options: (1) Set RESEND_API_KEY + verified "from" domain (HTTPS, works on free tier), or
// (2) Upgrade Render to a paid instance type to use SMTP again.
//
// SMTP: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO, CONTACT_FROM
// Resend: RESEND_API_KEY, CONTACT_TO, CONTACT_FROM (from must be verified in Resend for your domain)
const smtpHost = process.env.SMTP_HOST || '';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const contactTo = process.env.CONTACT_TO || '';
const contactFrom = process.env.CONTACT_FROM || smtpUser || 'no-reply@cxelevate.com';

if (!contactTo) {
  console.warn('Warning: CONTACT_TO is not set. Emails will not be sent.');
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Send via Resend HTTPS API (not blocked on Render Free).
 * https://resend.com/docs/api-reference/emails/send-email
 */
async function sendContactEmailResend({ to, from, replyTo, subject, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      text,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || (typeof data === 'object' ? JSON.stringify(data) : '') || res.statusText;
    throw new Error(msg || `Resend API error ${res.status}`);
  }
  return data;
}

app.post('/api/contact', async (req, res) => {
  try {
    console.log('Contact form submission received:', req.body);
    const { company, name, email, phone, summary } = req.body || {};

    if (!company || !name || !email || !summary) {
      console.log('Missing required fields:', { company: !!company, name: !!name, email: !!email, summary: !!summary });
      return res.status(400).json({ ok: false, error: 'Missing required fields.' });
    }

    if (!contactTo) {
      console.error('CONTACT_TO environment variable not set');
      return res.status(500).json({ ok: false, error: 'Email not configured.' });
    }

    const subject = `New Contact Form Submission - ${company}`;
    const text = `New inquiry from CX Elevate website\n\nCompany: ${company}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nSummary:\n${summary}`;

    console.log('Attempting to send email to:', contactTo);

    if (process.env.RESEND_API_KEY) {
      console.log('Using Resend API (HTTPS)');
      await sendContactEmailResend({
        to: contactTo,
        from: contactFrom,
        replyTo: email,
        subject,
        text,
      });
    } else {
      console.log('Using SMTP:', smtpHost, 'Port:', smtpPort);
      if (!smtpHost) {
        console.error('Neither RESEND_API_KEY nor SMTP_HOST is set.');
        return res.status(500).json({
          ok: false,
          error:
            'Email not configured. On Render Free, SMTP is blocked — set RESEND_API_KEY (see server.js comments) or upgrade Render and use SMTP.',
        });
      }

      const mailOptions = {
        from: contactFrom,
        to: contactTo,
        replyTo: email,
        subject,
        text,
      };

      const SEND_TIMEOUT_MS = 25000;
      await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Email send timed out')), SEND_TIMEOUT_MS)
        ),
      ]);
    }

    console.log('Email sent successfully');
    return res.json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    console.error('Error details:', err.message, err.stack);
    return res.status(500).json({ ok: false, error: 'Failed to send message. ' + (err.message || '') });
  }
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


