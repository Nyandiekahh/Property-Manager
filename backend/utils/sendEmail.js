import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587, // Default to 587 for TLS
    secure: false, // Use TLS
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    },
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,         // Your Gmail address
      pass: process.env.EMAIL_PASSWORD      // App-specific password
    }
  });

  const mailOptions = {
    from: `"RentFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
};
