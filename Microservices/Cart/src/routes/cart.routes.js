const express = require("express");
const cartController = require("../controllers/cart.controller");
const { createCartValidation } = require("../validators/cart.validator");
const createAuthMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();


router.get("/", createAuthMiddleware(["user"]), cartController.getCart);

router.post("/items", createCartValidation, createAuthMiddleware(["user"]), cartController.addItemToCart);

module.exports = router;
