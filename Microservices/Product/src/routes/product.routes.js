const express = require("express");
const multer = require("multer");
const productController = require("../controllers/product.controller");
const createAuthMiddleware = require("../middlewares/auth.middleware");
const { createProductValidators } = require("../validators/product.validators");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/products

router.post(
  "/",
  createAuthMiddleware(["admin", "seller"]),
  upload.array("images", 5),
  createProductValidators,
  productController.createProduct
);

// GET /api/products
router.get("/", productController.getProducts);

// Search products (must be before /:id route)
router.get("/search", productController.searchProducts);

router.get("/seller", createAuthMiddleware(["seller"]), productController.getProductsBySeller);

// GET /api/products/:id
router.get("/:id", productController.getProductById);

router.patch(
  "/:id",
  createAuthMiddleware(["admin", "seller"]),
  upload.array("images", 5),
  productController.updateProduct
);

router.delete(
  "/:id",
  createAuthMiddleware(["seller"]),
  productController.deleteProduct
);

module.exports = router;
