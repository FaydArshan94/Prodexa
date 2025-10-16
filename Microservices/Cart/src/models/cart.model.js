const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        
        // Product snapshot - stored at time of adding to cart
        productSnapshot: {
          title: { type: String, required: true },
          price: { type: Number, required: true },
          image: { type: String, required: true },
          stock: { type: Number },
          discountPrice: { type: Number },
        },
        
        // Track when this was added/last updated
        addedAt: { type: Date, default: Date.now },
        priceAtAdd: { type: Number }, // Original price when added
      },
    ],
  },
  { timestamps: true }
);

const Cart = mongoose.model("cart", cartSchema);

module.exports = Cart;