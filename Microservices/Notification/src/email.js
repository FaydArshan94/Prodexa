require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('📧 Email Configuration:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER ? 'Set ✅' : 'NOT SET ❌');
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set ✅' : 'NOT SET ❌');

// Use App Password instead of OAuth2 (much simpler!)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail
    pass: process.env.EMAIL_PASS, // Gmail App Password (NOT your regular password!)
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error connecting to email server:', error);
    console.error('💡 Make sure you have:');
    console.error('   1. Set EMAIL_USER and EMAIL_PASS in environment variables');
    console.error('   2. Generated an App Password in Gmail settings');
    console.error('   3. Enabled 2-Step Verification in your Google account');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    console.log(`📧 Sending email...`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    
    const info = await transporter.sendMail({
      from: `"Prodexa" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw error;
  }
};

module.exports = { sendEmail };


// ============================================
// FILE 4: app.js (IMPROVED ERROR HANDLING)
// ============================================
