const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        product: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: {
          amount: {
            type: Number,
            required: true,
          },
          currency: {
            type: String,
            required: true,
            enum: ["USD", "INR"],
          },
        },
      },
    ],
    totalPrice: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true, enum: ["USD", "INR"] },
    },
    status: {
      type: String,
      enum: ["Pending","Shipped", "Delivered", "Cancelled"],
    },
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    paymentMethod: {
      type: {
        type: String,
        required: true,
        enum: ["COD", "RAZORPAY"],
      },
      details: {
        method: {
          type: String,
          enum: ["card", "upi", "netbanking", null],
          default: null,
        },
        last4: {
          type: String,
          default: null,
        },
        bank: {
          type: String,
          default: null,
        },
      },
    },
    cancellationReason: { type: String, minlength: 10, maxlength: 500, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);
const orderModel = mongoose.model("Order", orderSchema);

module.exports = orderModel;
