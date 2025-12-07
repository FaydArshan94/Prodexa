const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail({ email, subject, html }) {
  try {
    console.log("📤 Attempting to send email to:", email);
    console.log("🔑 API Key available:", !!process.env.RESEND_API_KEY);

    const response = await resend.emails.send({
      from: "Prodexa <onboarding@resend.dev>",
      to: email,
      subject,
      html,
    });

    if (response?.id) {
      console.log("✅ Email sent successfully! ID:", response.id);
      return response;
    } else {
      console.error("❌ Unexpected response from Resend:", response);
      throw new Error("No email ID in response");
    }
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    console.error("❌ Full error:", error);
    throw error;
  }
}

module.exports = { sendWelcomeEmail };
