const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail(email, fullName) {
  try {
    const response = await resend.emails.send({
      from: "Prodexa <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to Prodexa!",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Welcome, ${fullName.firstName}!</h2>
          <p>Thank you for registering at Prodexa.</p>
          <p>We’re happy to have you onboard 🚀</p>
        </div>
      `,
    });

    console.log("📧 Email sent:", response.id);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
}

module.exports = { sendWelcomeEmail };
