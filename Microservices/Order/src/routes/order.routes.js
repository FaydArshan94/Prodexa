const express = require("express");
const createAuthMiddleware = require("../middlewares/auth.middleware");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderAddress,
  cancelOrder
} = require("../controllers/order.controller");
const { createOrderValidation } = require("../validators/order.validator");

const router = express.Router();

router.post(
  "/",
  createAuthMiddleware(["user"]),
  createOrderValidation,
  createOrder
);

router.get("/me", createAuthMiddleware(["user"]), getOrders);
router.get("/:id", createAuthMiddleware(["user"]), getOrderById);

router.patch(
  "/:id/address",
  createAuthMiddleware(["user"]),
  updateOrderAddress
);

router.post(
  "/:id/cancel",
  createAuthMiddleware(["user"]),
  cancelOrder
);

module.exports = router;
