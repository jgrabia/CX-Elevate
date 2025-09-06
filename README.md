# CX Elevate Website

Static marketing site with a simple Node/Express backend to deliver a contact form that emails submissions via SMTP (Nodemailer). Designed for easy deployment on Render.

## Tech Stack
- HTML/CSS frontend (no framework)
- Node.js + Express backend
- Nodemailer for SMTP email

## Project Structure
- `index.html`, `about.html`, `services.html`, `contact.html`: Site pages
- `style.css`: Global styles
- `server.js`: Express app with `/api/contact` endpoint and static file serving
- `package.json`: Dependencies and start scripts
- `.env` (not committed): Environment variables for SMTP + contact email

## Prerequisites
- Node.js 18+ (recommended)
- An SMTP provider (e.g., Gmail with App Password, SendGrid, Mailgun, Postmark, etc.)

## Setup (Local)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file from the template and fill in values:
   ```bash
   copy .env.example .env
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open the site:
   - http://localhost:3000
   - Submit the form on `contact.html` and check your inbox for the email.

## Environment Variables
Add these to your `.env` (and to Render’s Environment tab when deploying):

- `CONTACT_TO` (required): Destination email address for form submissions
- `CONTACT_FROM` (recommended): From/sender address; often the same as your SMTP user
- `SMTP_HOST` (required): SMTP server host (e.g., `smtp.gmail.com`, `smtp.sendgrid.net`)
- `SMTP_PORT` (required): Commonly `587` (TLS) or `465` (SSL)
- `SMTP_USER` (required): SMTP username
- `SMTP_PASS` (required): SMTP password (or API key for providers like SendGrid/Mailgun)
- `PORT` (optional): Express port (Render sets this automatically)

## SMTP Provider Notes
### Gmail (recommended only for low volume)
- Enable 2FA on your Google account
- Create an App Password (Security → App passwords)
- Use:
  - `SMTP_HOST=smtp.gmail.com`
  - `SMTP_PORT=587`
  - `SMTP_USER=your@gmail.com`
  - `SMTP_PASS=your_app_password`
  - `CONTACT_FROM=your@gmail.com`

### SendGrid
- Create an API key with Mail Send permissions
- Use SMTP credentials:
  - `SMTP_HOST=smtp.sendgrid.net`
  - `SMTP_PORT=587`
  - `SMTP_USER=apikey`
  - `SMTP_PASS=<your_sendgrid_api_key>`
  - `CONTACT_FROM=you@yourdomain.com` (verify domain/sender as needed)

### Mailgun
- From your domain settings, get SMTP credentials
- Use:
  - `SMTP_HOST=smtp.mailgun.org`
  - `SMTP_PORT=587`
  - `SMTP_USER=postmaster@yourdomain.com`
  - `SMTP_PASS=<your_mailgun_password>`
  - `CONTACT_FROM=you@yourdomain.com`

## Deploying on Render
1. Create a new Web Service on Render
2. Connect your GitHub repo containing this project
3. Settings:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add Environment Variables in Render’s dashboard (see list above)
5. Deploy

The Express server serves the static files and handles `/api/contact` POST requests from the contact form.

## How the Contact Form Works
- Frontend (`contact.html`) sends a JSON POST to `/api/contact`
- Backend (`server.js`) validates required fields and sends an email via Nodemailer/SMTP
- Success/Failure messages are displayed below the form submit button

## Troubleshooting
- Not receiving emails:
  - Ensure `CONTACT_TO` is set and correct
  - Verify all SMTP variables are set and valid
  - Try `SMTP_PORT=587` first; if your provider requires SSL, use `465`
  - Check spam/junk folders; set `CONTACT_FROM` to a verified domain/sender
- Render deployment issues:
  - Check Logs in Render dashboard for runtime errors
  - Ensure Start Command is `npm start`
  - Confirm env vars exist in the Web Service, not just locally

## Security
- Do not commit `.env` to version control
- Prefer provider-specific SMTP with domain verification for best deliverability

## License
Proprietary. All rights reserved by CX Elevate.
