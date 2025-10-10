const express = require("express");
const {
  getMetrics,
  getSellerOrders,
  getSellerProducts,
} = require("../controllers/seller.controller.js");
const createAuthMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/metrics", createAuthMiddleware(["seller"]), getMetrics);
router.get("/orders", createAuthMiddleware(["seller"]), getSellerOrders);
router.get("/products", createAuthMiddleware(["seller"]), getSellerProducts);

module.exports = router;
