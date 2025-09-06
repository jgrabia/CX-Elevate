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
// Supports either SMTP credentials or a simple "forward via Gmail/other" approach.
// Recommended for Render: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO, CONTACT_FROM
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
});

app.post('/api/contact', async (req, res) => {
  try {
    const { company, name, email, phone, summary } = req.body || {};

    if (!company || !name || !email || !summary) {
      return res.status(400).json({ ok: false, error: 'Missing required fields.' });
    }

    if (!contactTo) {
      return res.status(500).json({ ok: false, error: 'Email not configured.' });
    }

    const subject = `New Contact Form Submission - ${company}`;
    const text = `New inquiry from CX Elevate website\n\nCompany: ${company}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nSummary:\n${summary}`;

    await transporter.sendMail({
      from: contactFrom,
      to: contactTo,
      replyTo: email,
      subject,
      text,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ ok: false, error: 'Failed to send message.' });
  }
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


