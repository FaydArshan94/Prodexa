const userModel = require("../models/user.model");
const productModel = require("../models/product.model");
const orderModel = require("../models/order.model");
const axios = require("axios");

async function getMetrics(req, res) {
  try {
    const seller = req.user;

    // Get all products for this seller
    const products = await productModel.find({ seller: seller.id });
    const productIds = products.map((p) => p._id);

    // Get all orders containing seller's products
    const orders = await orderModel.find({
      "items.productId": { $in: productIds },
      status: { $in: ["Shipped", "Delivered"] },
    });

    // Sales: total number of items sold
    let sales = 0;
    let revenue = 0;
    const productSales = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (productIds.some((id) => id.toString() === item.productId.toString())) {
          sales += item.quantity;
          revenue += item.price.amount * item.quantity;
          productSales[item.productId] =
            (productSales[item.productId] || 0) + item.quantity;
        }
      });
    });

    // Top products by quantity sold
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, qty]) => {
        const prod = products.find((p) => p._id.equals(productId));
        return prod ? { id: prod._id, title: prod.title, sold: qty } : null;
      })
      .filter(Boolean);

    return res.json({
      sales,
      revenue,
      topProducts,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function getSellerOrders(req, res) {
  try {
    const seller = req.user;

    // Get all products for this seller
    const products = await productModel.find({ seller: seller.id });
    const productIds = products.map((p) => p._id);

    // Get all orders containing seller's products
    const orders = await orderModel
      .find({
        "items.productId": { $in: productIds }, // ✅ Fixed: use productId
      })
      .populate("user", "username email")
      .populate("items.product") // This populates the product details
      .sort({ createdAt: -1 });

    // Filter order items to only include those from this seller
    const filteredOrders = orders
      .map((order) => {
        const filteredItems = order.items.filter((item) =>
          productIds.some((id) => id.toString() === item.productId.toString())
        );
        return {
          ...order.toObject(),
          items: filteredItems,
        };
      })
      .filter((order) => order.items.length > 0);

    return res.json(filteredOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function getSellerProducts(req, res) {
  try {
    const sellerId = req.user.id;

    // ✅ Fetch directly from Product Service
    const productApiUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001/api/products/';
    const response = await axios.get(productApiUrl, {
      headers: {
        Authorization: req.headers.authorization, // Forward auth token
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Failed to fetch products:", error.message);
    return res.status(500).json({ message: "Failed to fetch products" });
  }
}
module.exports = {
  getMetrics,
  getSellerOrders,
  getSellerProducts,
};
