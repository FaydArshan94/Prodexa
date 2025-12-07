// ============================================
// FILE: email.js
// Location: Microservices/Notification/src/email.js
// ============================================

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('📧 Initializing Email Service...');
console.log('   EMAIL_USER:', process.env.EMAIL_USER ? 'Set ✅' : 'NOT SET ❌');
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set ✅' : 'NOT SET ❌');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email server connection failed:', error.message);
    console.error('💡 Check:');
    console.error('   1. EMAIL_USER and EMAIL_PASS are set');
    console.error('   2. Using Gmail App Password (not regular password)');
    console.error('   3. 2-Step Verification enabled');
  } else {
    console.log('✅ Email server ready to send messages');
  }
});

// Send email function
async function sendEmail(to, subject, text, html) {
  try {
    console.log(`📧 Sending email...`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured');
    }
    
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
    console.error('❌ Failed to send email:', error.message);
    console.error('   Error details:', error);
    throw error;
  }
}

// Export using module.exports
module.exports = {
  sendEmail
};

console.log('📧 Email module loaded, sendEmail function exported');