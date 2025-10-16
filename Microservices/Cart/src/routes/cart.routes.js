const express = require("express");
const cartController = require("../controllers/cart.controller");
const { createCartValidation, updateCartItemValidation } = require("../validators/cart.validator");
const createAuthMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();


router.get("/", createAuthMiddleware(["user"]), cartController.getCart);

router.post("/items", createCartValidation, createAuthMiddleware(["user"]), cartController.addItemToCart);

router.patch("/items/:productId", updateCartItemValidation, createAuthMiddleware(["user"]), cartController.updateCartItem);

router.delete("/items/:productId", createAuthMiddleware(["user"]), cartController.removeItemFromCart);


module.exports = router;
