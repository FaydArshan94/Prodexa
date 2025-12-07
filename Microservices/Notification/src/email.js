// ============================================
// FILE: email.js
// Location: Microservices/Notification/src/email.js
// OAuth2 Gmail Configuration for better reliability
// ============================================

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('📧 Initializing Email Service...');
console.log('   EMAIL_USER:', process.env.EMAIL_USER ? 'Set ✅' : 'NOT SET ❌');
console.log('   OAuth2 Credentials:', process.env.CLIENT_ID && process.env.REFRESH_TOKEN ? 'Set ✅' : 'Using APP_PASSWORD');

let transporter = null;

// Create transporter with OAuth2
async function createTransporter() {
  try {
    // Use OAuth2 for better reliability on Render
    const config = {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessUrl: 'https://oauth.google.com/o/oauth2/token',
      },
      pool: {
        maxConnections: 1,
        maxMessages: 100,
      },
      connectionTimeout: 30000,
      socketTimeout: 30000,
    };

    const newTransporter = nodemailer.createTransport(config);
    
    // Verify connection
    await new Promise((resolve, reject) => {
      newTransporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email server connection failed:', error.message);
          console.error('💡 OAuth2 Setup Issues:');
          console.error('   1. CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN must be set');
          console.error('   2. Make sure OAuth2 is enabled in Google Cloud Console');
          console.error('   3. Refresh token must be valid');
          reject(error);
        } else {
          console.log('✅ Email server (OAuth2) ready to send messages');
          resolve(success);
        }
      });
    });

    return newTransporter;
  } catch (error) {
    console.error('❌ Failed to create transporter:', error.message);
    throw error;
  }
}

// Get or create transporter (lazy initialization)
async function getTransporter() {
  if (!transporter) {
    try {
      transporter = await createTransporter();
    } catch (error) {
      console.error('❌ Transporter creation failed, will retry on next email send');
      transporter = null;
      throw error;
    }
  }
  return transporter;
}

// Send email function with retry logic
async function sendEmail(to, subject, text, html) {
  let retries = 3;
  let lastError;

  while (retries > 0) {
    try {
      console.log(`📧 Sending email...`);
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      
      if (!process.env.EMAIL_USER) {
        throw new Error('EMAIL_USER not configured');
      }

      // Get fresh transporter (will create if needed)
      const transport = await getTransporter();
      
      const info = await transport.sendMail({
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
      lastError = error;
      retries--;
      
      console.error(`❌ Failed to send email (Retry ${3 - retries}/3):`, error.message);
      
      if (retries > 0) {
        // Reset transporter on failure to force reconnection
        transporter = null;
        console.log('🔄 Retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.error('❌ All retries exhausted. Email delivery failed.');
        console.error('   Error details:', error);
      }
    }
  }

  throw lastError;
}

// Export using module.exports
module.exports = {
  sendEmail,
  getTransporter,
};

console.log('📧 Email module loaded with OAuth2 support');