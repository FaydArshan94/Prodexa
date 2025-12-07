const { subscribeToQueue } = require("./broker");
const { sendWelcomeEmail } = require("../email");

// Production-ready email notification handlers
module.exports = function () {
  console.log("🎧 Setting up queue listeners...");

  // ✅ User Registration - Welcome Email
  subscribeToQueue("NOTIF_AUTH.USER_CREATED", async (data) => {
    try {
      if (!data.email || !data.username) {
        throw new Error("Invalid user data: missing email or username");
      }

      console.log("📧 Processing welcome email for:", data.username);

      const emailHTMLTemplate = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f5f5f5; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #2563eb; margin-top: 0; text-align: center;">Welcome to Prodexa! 🎉</h1>
              <p style="font-size: 16px; color: #333;">Dear <strong>${data.username}</strong>,</p>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">Thank you for registering with us. We're excited to have you on board!</p>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">Start exploring our amazing products and enjoy shopping! 🛍️</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">Best regards,<br/><strong>The Prodexa Team</strong></p>
            </div>
          </body>
        </html>
      `;

      await sendWelcomeEmail({
        email: data.email,
        subject: "Welcome to Prodexa!",
        html: emailHTMLTemplate,
      });

      console.log("✅ Welcome email processed successfully for:", data.email);
    } catch (error) {
      console.error("❌ Welcome email failed:", {
        user: data.username,
        email: data.email,
        error: error.message,
      });
    }
  });

  // ✅ Payment Completed
  subscribeToQueue("PAYMENT.NOTIFICATION_COMPLETED", async (data) => {
    try {
      if (!data.email || !data.username || !data.orderId) {
        throw new Error("Invalid payment data");
      }

      console.log("📧 Processing payment confirmation for:", data.username);

      const amount = data.amount ? (data.amount / 100).toFixed(2) : "0.00";

      const emailHTMLTemplate = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f5f5f5; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #16a34a; margin-top: 0; text-align: center;">Payment Successful! ✅</h1>
              <p style="font-size: 16px; color: #333;">Dear <strong>${data.username}</strong>,</p>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">We have successfully received your payment!</p>
              <div style="background: #f0fdf4; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <p style="margin: 8px 0; font-size: 14px;"><strong>💰 Amount:</strong> ${data.currency || "INR"} ${amount}</p>
                <p style="margin: 8px 0; font-size: 14px;"><strong>📦 Order ID:</strong> ${data.orderId}</p>
                ${data.paymentId ? `<p style="margin: 8px 0; font-size: 14px;"><strong>🔐 Payment ID:</strong> ${data.paymentId}</p>` : ""}
              </div>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">Thank you for your purchase! Your order will be processed shortly.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">Best regards,<br/><strong>The Prodexa Team</strong></p>
            </div>
          </body>
        </html>
      `;

      await sendWelcomeEmail({
        email: data.email,
        subject: `Payment Confirmation - Order #${data.orderId}`,
        html: emailHTMLTemplate,
      });

      console.log("✅ Payment email processed successfully for:", data.email);
    } catch (error) {
      console.error("❌ Payment confirmation email failed:", {
        user: data.username,
        orderId: data.orderId,
        error: error.message,
      });
    }
  });

  // ✅ Payment Failed
  subscribeToQueue("PAYMENT.NOTIFICATION_FAILED", async (data) => {
    try {
      if (!data.email || !data.username || !data.orderId) {
        throw new Error("Invalid payment failure data");
      }

      console.log("📧 Processing payment failure notification for:", data.username);

      const emailHTMLTemplate = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f5f5f5; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #dc2626; margin-top: 0; text-align: center;">Payment Failed ❌</h1>
              <p style="font-size: 16px; color: #333;">Dear <strong>${data.username}</strong>,</p>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">Unfortunately, your payment could not be processed at this time.</p>
              <div style="background: #fef2f2; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="margin: 8px 0; font-size: 14px;"><strong>📦 Order ID:</strong> ${data.orderId}</p>
                ${data.reason ? `<p style="margin: 8px 0; font-size: 14px;"><strong>❌ Reason:</strong> ${data.reason}</p>` : ""}
              </div>
              <p style="font-size: 14px; color: #666; line-height: 1.6;"><strong>What to do next:</strong></p>
              <ul style="font-size: 14px; color: #666; line-height: 1.8;">
                <li>Please try again with the same or different payment method</li>
                <li>Check your card/account details and try again</li>
                <li>Contact our support team if the issue persists</li>
              </ul>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">Best regards,<br/><strong>The Prodexa Team</strong></p>
            </div>
          </body>
        </html>
      `;

      await sendWelcomeEmail({
        email: data.email,
        subject: `Payment Failed - Order #${data.orderId}`,
        html: emailHTMLTemplate,
      });

      console.log("✅ Payment failure email processed successfully for:", data.email);
    } catch (error) {
      console.error("❌ Payment failure email failed:", {
        user: data.username,
        orderId: data.orderId,
        error: error.message,
      });
    }
  });

  // ✅ Product Created
  subscribeToQueue("PRODUCT_NOTIFICATION.PRODUCT_CREATED", async (data) => {
    try {
      if (!data.email || !data.username || !data.productId) {
        throw new Error("Invalid product data");
      }

      console.log("📧 Processing product creation notification for:", data.username);

      const emailHTMLTemplate = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f5f5f5; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #2563eb; margin-top: 0; text-align: center;">Your Product is Live! 🎉</h1>
              <p style="font-size: 16px; color: #333;">Dear <strong>${data.username}</strong>,</p>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">Congratulations! Your product has been successfully created and is now live on Prodexa!</p>
              <div style="background: #eff6ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2563eb;">
                <p style="margin: 8px 0; font-size: 14px;"><strong>🆔 Product ID:</strong> ${data.productId}</p>
                ${data.productName ? `<p style="margin: 8px 0; font-size: 14px;"><strong>📛 Product Name:</strong> ${data.productName}</p>` : ""}
              </div>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">Your product is now visible to millions of potential customers. Best of luck with your sales! 🚀</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">Best regards,<br/><strong>The Prodexa Team</strong></p>
            </div>
          </body>
        </html>
      `;

      await sendWelcomeEmail({
        email: data.email,
        subject: `Your Product "${data.productName || "New Product"}" is Live!`,
        html: emailHTMLTemplate,
      });

      console.log("✅ Product creation email processed successfully for:", data.email);
    } catch (error) {
      console.error("❌ Product creation email failed:", {
        user: data.username,
        productId: data.productId,
        error: error.message,
      });
    }
  });

  console.log("✅ All queue listeners initialized!");
};
