const { body, validationResult, param } = require("express-validator");
const mongoose = require("mongoose");

function validateResult(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Validation error", errors: errors.array() });
  }
  next();
}

const createCartValidation = [
  body("productId")
    .isString()
    .withMessage("productId is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid productId"),
  body("quantity")
    .isInt({ gt: 0 })
    .withMessage("quantity must be a positive integer"),
  validateResult,
];

const updateCartItemValidation = [
  param("productId")
    .isString()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid productId"),
  body("quantity")
    .isInt({ gt: 0 })
    .withMessage("quantity must be a positive integer"),
  validateResult,
];

module.exports = { createCartValidation, updateCartItemValidation };
