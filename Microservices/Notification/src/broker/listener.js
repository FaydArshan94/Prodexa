const { subscribeToQueue } = require("./broker");
const { sendWelcomeEmail  } = require("../email");

module.exports = function () {
  console.log('🎧 Setting up queue listeners...');

  // ✅ User Registration
  subscribeToQueue("AUTH_NOTIFICATION.USER_CREATED", async (data) => {
    console.log('📧 Sending welcome email to:', data.email);
    
    const emailHTMLTemplate = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2563eb;">Welcome to Prodexa! 🎉</h1>
            <p>Dear <strong>${data.username}</strong>,</p>
            <p>Thank you for registering with us. We're excited to have you on board!</p>
            <p>Start exploring our amazing products and enjoy shopping! 🛍️</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br/>The Prodexa Team</p>
          </div>
        </body>
      </html>
    `;

    try {
      await sendWelcomeEmail (
        data.email,
        "Welcome to Prodexa",
        "Thank you for registering with us!",
        emailHTMLTemplate
      );
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
    }
  });

  // ✅ Payment Completed - FIXED QUEUE NAME (was PAYMENT_NOTIFICATION.PAYMENT_COMPLETED)
  subscribeToQueue("PAYMENT.NOTIFICATION_COMPLETED", async (data) => {
    console.log('📧 Sending payment confirmation to:', data.email);
    
    const amount = (data.amount / 100).toFixed(2); // Convert paise to rupees
    
    const emailHTMLTemplate = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #16a34a;">Payment Successful! ✅</h1>
            <p>Dear <strong>${data.username}</strong>,</p>
            <p>We have successfully received your payment!</p>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Amount:</strong> ${data.currency} ${amount}</p>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${data.orderId}</p>
              <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${data.paymentId}</p>
            </div>
            <p>Thank you for your purchase! Your order will be processed shortly.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br/>The Prodexa Team</p>
          </div>
        </body>
      </html>
    `;
    
    try {
      await sendWelcomeEmail (
        data.email,
        "Payment Successful - Prodexa",
        "We have received your payment",
        emailHTMLTemplate
      );
    } catch (error) {
      console.error('❌ Failed to send payment confirmation:', error);
    }
  });

  // ✅ Payment Failed - FIXED QUEUE NAME
  subscribeToQueue("PAYMENT.NOTIFICATION_FAILED", async (data) => {
    console.log('📧 Sending payment failure notification to:', data.email);
    
    const emailHTMLTemplate = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #dc2626;">Payment Failed ❌</h1>
            <p>Dear <strong>${data.username}</strong>,</p>
            <p>Unfortunately, your payment could not be processed.</p>
            <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${data.orderId}</p>
            </div>
            <p>Please try again or contact our support team if the issue persists.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br/>The Prodexa Team</p>
          </div>
        </body>
      </html>
    `;
    
    try {
      await sendWelcomeEmail (
        data.email,
        "Payment Failed - Prodexa",
        "Your payment could not be processed",
        emailHTMLTemplate
      );
    } catch (error) {
      console.error('❌ Failed to send payment failure email:', error);
    }
  });

  // ✅ Product Created
  subscribeToQueue("PRODUCT_NOTIFICATION.PRODUCT_CREATED", async (data) => {
    console.log('📧 Sending product creation notification to:', data.email);
    
    const emailHTMLTemplate = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2563eb;">Your Product is Live! 🎉</h1>
            <p>Dear <strong>${data.username}</strong>,</p>
            <p>Congratulations! Your product has been successfully created and is now live on Prodexa!</p>
            <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Product ID:</strong> ${data.productId}</p>
            </div>
            <p>Customers can now view and purchase your product. Good luck with your sales! 🚀</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br/>The Prodexa Team</p>
          </div>
        </body>
      </html>
    `;
    
    try {
      await sendWelcomeEmail (
        data.email,
        "Product Created Successfully - Prodexa",
        "Your product is now live",
        emailHTMLTemplate
      );
    } catch (error) {
      console.error('❌ Failed to send product creation email:', error);
    }
  });

  console.log('✅ All queue listeners are set up!');
};