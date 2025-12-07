const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail({ email, subject, html }) {
  try {
    const response = await resend.emails.send({
      from: "Prodexa <onboarding@resend.dev>",
      to: email,
      subject,
      html,
    });

    console.log("📧 Email sent:", response.id);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
}

module.exports = { sendWelcomeEmail };
