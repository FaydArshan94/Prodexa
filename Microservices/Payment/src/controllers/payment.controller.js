const paymentModel = require("../models/payment.model");
const axios = require("axios");

require("dotenv").config();
const Razorpay = require("razorpay");
const { publishToQueue } = require("../broker/broker");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper function to fetch order with retry
const fetchOrderWithRetry = async (orderId, token, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Fetching order ${orderId} (attempt ${i + 1}/${retries})...`);
      
      const orderResponse = await axios.get(
        `https://prodexa-order.onrender.com/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      console.log(`✅ Order ${orderId} fetched successfully`);
      return orderResponse;
    } catch (error) {
      console.error(`❌ Attempt ${i + 1} failed:`, error.message);
      
      // If it's the last retry, throw error
      if (i === retries - 1) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

async function createPayment(req, res) {
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
  const user = req.user;

  console.log('💳 Creating payment:', {
    orderId: req.params.orderId,
    userId: user.id,
    username: user.username
  });

  try {
    const orderId = req.params.orderId;

    // Fetch order with retry logic
    const orderResponse = await fetchOrderWithRetry(orderId, token);
    const price = orderResponse.data.order.totalPrice;

    console.log('💰 Order price:', price);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: price.amount * 100, // Razorpay expects amount in paise
      currency: price.currency || "INR",
      receipt: `order_${orderId}`,
    });

    console.log('✅ Razorpay order created:', razorpayOrder.id);

    // Save payment in database
    const payment = await paymentModel.create({
      order: orderId,
      razorpayOrderId: razorpayOrder.id,
      user: user.id,
      price: {
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      status: "PENDING"
    });

    console.log('✅ Payment record created:', payment._id);

    return res.status(201).json({
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    console.error("❌ Error creating payment:", error);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

async function verifyPayment(req, res) {
  const { razorpayOrderId, paymentId, signature, paymentDetails } = req.body;
  const user = req.user;

  console.log('🔐 Verifying payment:', {
    razorpayOrderId,
    paymentId,
    userId: user.id
  });

  const secret = process.env.RAZORPAY_KEY_SECRET;

  try {
    const {
      validatePaymentVerification,
    } = require("../../node_modules/razorpay/dist/utils/razorpay-utils");

    const isValid = validatePaymentVerification(
      {
        order_id: razorpayOrderId,
        payment_id: paymentId,
      },
      signature,
      secret
    );

    console.log('🔍 Signature validation:', isValid);

    if (!isValid) {
      console.log('❌ Invalid payment signature');
      return res.status(400).json({ 
        success: false,
        message: "Invalid payment signature" 
      });
    }

    const payment = await paymentModel.findOne({
      razorpayOrderId,
      status: "PENDING",
    });

    if (!payment) {
      console.log('❌ Payment not found');
      return res.status(404).json({ 
        success: false,
        message: "Payment not found" 
      });
    }

    // Update payment record
    payment.razorpayPaymentId = paymentId;
    payment.status = "COMPLETED";
    payment.signature = signature;
    
    // Add payment details if provided
    if (paymentDetails) {
      payment.paymentDetails = {
        method: paymentDetails.method,
        bank: paymentDetails.bank,
        last4: paymentDetails.last4
      };
    }

    await payment.save();

    console.log('✅ Payment verified and updated');

    // Publish to queue
    publishToQueue("PAYMENT.NOTIFICATION_COMPLETED", {
      username: user.username,
      email: user.email,
      paymentId: payment._id,
      orderId: payment.order,
      userId: payment.user,
      amount: payment.price.amount,
      currency: payment.price.currency,
    }).catch((err) => console.error("Queue publish error:", err));

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        id: payment._id,
        status: payment.status,
        orderId: payment.order,
        amount: payment.price.amount,
        currency: payment.price.currency
      },
    });
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    console.error('Error stack:', error.stack);

    // Publish failure notification
    publishToQueue("PAYMENT.NOTIFICATION_FAILED", {
      paymentId: paymentId,
      orderId: razorpayOrderId,
      username: user.username,
      email: user.email,
    }).catch((err) => console.error("Queue publish error:", err));

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

module.exports = { createPayment, verifyPayment };