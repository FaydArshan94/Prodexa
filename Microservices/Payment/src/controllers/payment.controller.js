const paymentModel = require("../models/payment.model");
const axios = require("axios");

require("dotenv").config();
const Razorpay = require("razorpay");
const { publishToQueue } = require("../broker/broker");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createPayment(req, res) {
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

  try {
    const orderId = req.params.orderId;

    const orderResponse = await axios.get(
      `https://prodexa-order.onrender.com/api/orders/` + orderId,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const price = orderResponse.data.order.totalPrice;

    const order = await razorpay.orders.create(price);

    const payment = await paymentModel.create({
      order: orderId,
      razorpayOrderId: order.id,
      user: req.user.id,
      price: {
        amount: order.amount,
        currency: order.currency,
      },
    });

    return res.status(201).json({
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
async function verifyPayment(req, res) {
  const { razorpayOrderId, paymentId, signature } = req.body;

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

    if (!isValid) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const payment = await paymentModel.findOne({
      razorpayOrderId,
      status: "PENDING",
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.razorpayPaymentId = paymentId;
    payment.status = "COMPLETED";
    payment.signature = signature;

    await payment.save();

    // Publish to queue (don't await if you don't want to block)
    publishToQueue("PAYMENT.NOTIFICATION_COMPLETED", {
      username: req.user.username,
      paymentId: payment._id,
      orderId: payment.order,
      userId: payment.user,
      amount: payment.price.amount,
      currency: payment.price.currency,
    }).catch((err) => console.error("Queue publish error:", err));

    // ✅ ADD THIS - Send success response
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        id: payment._id,
        status: payment.status,
        orderId: payment.order,
      },
    });
  } catch (error) {
    console.log(error);

    // Publish failure notification (don't block on this either)
    publishToQueue("PAYMENT.NOTIFICATION_FAILED", {
      paymentId: paymentId,
      orderId: razorpayOrderId,
      username: req.user.username,
    }).catch((err) => console.error("Queue publish error:", err));

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
module.exports = { createPayment, verifyPayment };
