const orderModel = require("../models/order.model");
const { publishToQueue } = require("../broker/broker");
const axios = require("axios");

async function createOrder(req, res) {
  const user = req.user;
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

  console.log('📦 Creating order for user:', user.id);

  try {
    // FIXED: Correct Cart API URL
    console.log('🛒 Fetching cart...');
    const cartResponse = await axios.get(
      "https://prodexa-cart.onrender.com/api/cart",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Cart fetched:', cartResponse.data);

    if (!cartResponse.data.cart || !cartResponse.data.cart.items || cartResponse.data.cart.items.length === 0) {
      console.log('❌ Cart is empty');
      return res.status(400).json({
        success: false,
        message: "Cart is empty or not found",
      });
    }

    console.log('📦 Fetching product details...');
    const products = await Promise.all(
      cartResponse.data.cart.items.map(async (item) => {
        try {
          const productResponse = await axios.get(
            `https://prodexa-product.onrender.com/api/products/${item.productId}`
          );
          return productResponse.data.data;
        } catch (error) {
          console.error(`Failed to fetch product ${item.productId}:`, error.message);
          throw new Error(`Product ${item.productId} not found`);
        }
      })
    );

    console.log('✅ Products fetched:', products.length);

    let priceAmount = 0;
    const orderItems = cartResponse.data.cart.items.map((item) => {
      const product = products.find((p) => p._id === item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Product ${product.title} is out of stock or insufficient stock`
        );
      }

      const itemTotal = product.price.amount * item.quantity;
      priceAmount += itemTotal;

      return {
        product: {
          _id: product._id,
          title: product.title,
          image: product.images[0],
        },
        productId: item.productId,
        quantity: item.quantity,
        price: {
          amount: product.price.amount,
          currency: product.price.currency || "INR",
        },
        total: itemTotal,
      };
    });

    // Validate shipping address
    if (!req.body.shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    const { street, city, state, pincode, country } = req.body.shippingAddress;

    if (!street || !city || !state || !pincode || !country) {
      return res.status(400).json({ message: "Incomplete shipping address" });
    }

    // Validate payment method
    if (!req.body.paymentMethod || !req.body.paymentMethod.type) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    console.log('💾 Creating order in database...');
    const order = await orderModel.create({
      user: user.id,
      items: orderItems,
      status: "Pending",
      totalPrice: {
        amount: priceAmount,
        currency: "INR",
      },
      shippingAddress: {
        street,
        city,
        state,
        pincode,
        country,
      },
      paymentMethod: {
        type: req.body.paymentMethod.type,
        details:
          req.body.paymentMethod.type === "RAZORPAY"
            ? {
                method: req.body.paymentMethod.details?.method,
                last4: req.body.paymentMethod.details?.last4,
                bank: req.body.paymentMethod.details?.bank,
              }
            : null,
      },
    });

    console.log('✅ Order created:', order._id);

    // Clear cart
    console.log('🗑️ Clearing cart...');
    try {
      await axios.delete(
        "https://prodexa-cart.onrender.com/api/cart/clearCart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('✅ Cart cleared');
    } catch (error) {
      console.error('⚠️ Failed to clear cart:', error.message);
      // Continue even if cart clear fails
    }

    // Publish event
    console.log('📢 Publishing ORDER_CREATED event...');
    await publishToQueue("ORDER_CREATED", {
      _id: order._id,
      user: user.id,
      items: orderItems,
      status: order.status,
      totalPrice: order.totalPrice,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
    });

    console.log('✅ Order creation complete');
    res.status(201).json({ 
      message: "Order created successfully", 
      order 
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    console.error("Error stack:", error.stack);
    
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

async function getOrders(req, res) {
  const user = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const orders = await orderModel
      .find({ user: user.id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const totalOrders = await orderModel.countDocuments({ user: user.id });

    res.status(200).json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      meta: {
        total: totalOrders,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getOrderById(req, res) {
  const user = req.user;
  const orderId = req.params.id;

  try {
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await orderModel.findOne({ _id: orderId });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== user.id)
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });

    res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function updateOrderAddress(req, res) {
  const user = req.user;
  const orderId = req.params.id;
  const shippingAddress = req.body.shippingAddress || req.body;

  try {
    const order = await orderModel.findOne({ _id: orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== user.id)
      return res
        .status(403)
        .json({ message: "Not authorized to update this order" });

    if (!shippingAddress)
      return res.status(400).json({ message: "Invalid address data" });

    const { street, city, state, pincode, country } = shippingAddress;

    const pincodeStr = String(pincode);
    if (!pincodeStr || pincodeStr.length !== 6 || !/^\d+$/.test(pincodeStr))
      return res.status(400).json({ message: "Invalid pincode" });

    if (!street || !city || !state || !country)
      return res.status(400).json({ message: "Invalid address data" });

    if (order.status !== "Pending")
      return res
        .status(400)
        .json({ message: "Cannot update address for non-pending orders" });

    order.shippingAddress = { street, city, state, pincode, country };
    await order.save();

    await publishToQueue("ORDER_UPDATED", order);

    res.status(200).json({
      message: "Shipping address updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating shipping address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function cancelOrder(req, res) {
  const user = req.user;
  const orderId = req.params.id;
  const { reason } = req.body;

  try {
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    if (!reason || reason.trim() === "") {
      return res
        .status(400)
        .json({ message: "Cancellation reason is required" });
    }

    const order = await orderModel.findOne({ _id: orderId });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== user.id)
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });

    if (order.status === "Cancelled")
      return res.status(400).json({ message: "Order is already cancelled" });

    if (order.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled in current status" });
    }

    if (reason.length > 500) {
      return res
        .status(400)
        .json({ message: "Cancellation reason is too long" });
    }

    order.cancellationReason = reason;
    order.status = "Cancelled";
    order.cancelledAt = new Date();
    await order.save();

    await publishToQueue("ORDER_CANCELLED", { _id: order._id });

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderAddress,
  cancelOrder,
};