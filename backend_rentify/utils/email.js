const nodemailer = require('nodemailer');

// Disable TLS validation for development only
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Development transporter (no secure connection, skips TLS validation)
const devTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Production transporter (uses Gmail service with TLS)
const prodTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

// Choose which transporter to export based on environment
const transporter = process.env.NODE_ENV === 'production' ? prodTransporter : devTransporter;

module.exports = { transporter };
