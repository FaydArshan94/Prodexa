const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Production-ready email sender with sandbox mode support
 * In sandbox mode: emails go to verified email (SANDBOX_EMAIL env var)
 * In production: emails go to actual recipients (after domain verification)
 */
async function sendEmail({ email, subject, html, replyTo = "support@prodexa.com" }) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!email || !subject || !html) {
      throw new Error("Missing required email fields: email, subject, html");
    }

    // In sandbox mode, redirect to your verified email
    const isSandboxMode = !process.env.EMAIL_FROM || process.env.EMAIL_FROM.includes("resend.dev");
    const recipientEmail = isSandboxMode ? (process.env.SANDBOX_EMAIL || "arshanw94@gmail.com") : email;

    const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

    console.log("📧 Email Configuration:", {
      mode: isSandboxMode ? "SANDBOX" : "PRODUCTION",
      from: fromEmail,
      intendedRecipient: email,
      actualRecipient: recipientEmail,
    });

    const response = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: isSandboxMode ? `[TEST] ${subject}` : subject,
      html: isSandboxMode 
        ? `<p><strong>📧 Intended recipient:</strong> ${email}</p>${html}`
        : html,
      replyTo,
    });

    console.log("📥 Resend Response:", JSON.stringify(response));

    // Check for Resend API errors
    if (response.error) {
      console.error("❌ Resend API Error:", {
        statusCode: response.error.statusCode,
        message: response.error.message,
        recipient: recipientEmail,
      });
      throw new Error(`Resend Error: ${response.error.message}`);
    }

    // Check if we got a valid response - Resend returns {data: {id}, error: null}
    if (!response.data || !response.data.id) {
      console.error("❌ Invalid Resend response - no message ID:", response);
      throw new Error("Invalid response from Resend API - no message ID returned");
    }

    const messageId = response.data.id;

    console.log("✅ Email sent successfully", {
      messageId: messageId,
      intendedRecipient: email,
      actualRecipient: recipientEmail,
      mode: isSandboxMode ? "SANDBOX" : "PRODUCTION",
      timestamp: new Date().toISOString(),
    });

    return response;
  } catch (error) {
    console.error("❌ Email sending failed:", {
      error: error.message,
      recipient: email,
      subject,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

// Backwards compatibility wrapper
async function sendWelcomeEmail({ email, subject, html }) {
  return sendEmail({ email, subject, html });
}

module.exports = { sendEmail, sendWelcomeEmail };
