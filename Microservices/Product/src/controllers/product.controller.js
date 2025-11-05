const { publishToQueue } = require("../broker/broker");
const productModel = require("../models/product.model");
const { uploadImage } = require("../services/imagekit.service");
const mongoose = require("mongoose");
const axios = require("axios");

// Accepts multipart/form-data with fields: title, description, priceAmount, priceCurrency, images[] (files)
async function createProduct(req, res) {
  try {
    const { title, description, priceAmount, priceCurrency = "INR" } = req.body;
    const seller = req.user.id; // Extract seller from authenticated user

    const price = {
      amount: Number(priceAmount),
      currency: priceCurrency,
    };

    const images = await Promise.all(
      (req.files || []).map((file) => uploadImage({ buffer: file.buffer }))
    );

    const product = await productModel.create({
      title,
      description,
      price,
      seller,
      images,
    });

    await publishToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED", product);
    await publishToQueue("PRODUCT_NOTIFICATION.PRODUCT_CREATED", {
      email: req.user.email,
      productId: product._id,
      username: req.user.username,
    });

    return res.status(201).json({
      message: "Product created",
      data: product,
    });
  } catch (err) {
    console.error("Create product error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getProducts(req, res) {
  try {
    // Extract query parameters
    const { q, minprice, maxprice, skip = 0, limit = 20 } = req.query;

    // Build Mongo filter object dynamically
    const filter = {};

    // --- TEXT SEARCH ---
    if (q && q.trim()) {
      filter.$text = { $search: q.trim() };
    }

    // --- PRICE FILTERS ---
    if (minprice || maxprice) {
      filter["price.amount"] = {};

      if (minprice && !isNaN(minprice)) {
        filter["price.amount"].$gte = Number(minprice);
      }

      if (maxprice && !isNaN(maxprice)) {
        filter["price.amount"].$lte = Number(maxprice);
      }
    }

    // --- QUERY EXECUTION ---
    const products = await productModel
      .find(filter)
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 50)) // safety cap
      .lean(); // better performance

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function getProductById(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const product = await productModel.findById(id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // ✅ Fetch seller details from USER MICROSERVICE
  let sellerDetails = null;
  try {
    const response = await axios.get(
      `http://localhost:3000/api/auth/users/${product.seller}`
    );
    sellerDetails = response.data;
  } catch (error) {
    console.error("Failed to fetch user details:", error.message);
    // Continue execution with null seller details
  }

  return res.status(200).json({
    data: {
      ...product.toObject(),
      seller: sellerDetails || null, // fallback if user service unavailable
    },
  });
}

async function updateProduct(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const product = await productModel.findById(id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Only seller who created the product or admin can update
  if (product.seller.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only update your own products" });
  }

  // Only allow certain fields to be updated
  const allowedUpdates = ["title", "description", "images"];
  const updates = {};

  // Handle basic fields
  for (const field of allowedUpdates) {
    if (req.body[field]) {
      updates[field] = req.body[field];
    }
  }
  // Handle image uploads if files are present
  if (req.files && req.files.length > 0) {
    const newImages = await Promise.all(
      (req.files || []).map((file) => uploadImage({ buffer: file.buffer }))
    );
    updates.images = [...(product.images || []), ...newImages];
  }

  // Handle price separately due to nested structure
  if (req.body.priceAmount !== undefined || req.body.priceCurrency) {
    const priceAmount =
      req.body.priceAmount !== undefined
        ? Number(req.body.priceAmount)
        : product.price.amount;

    if (isNaN(priceAmount) || priceAmount < 0) {
      return res.status(400).json({ message: "Invalid price amount" });
    }

    updates.price = {
      amount: priceAmount,
    };

    if (req.body.priceCurrency) {
      updates.currency = req.body.priceCurrency;
    }
  }
  Object.assign(product, updates);
  await product.save();
  return res.status(200).json({
    message: "Product updated",
    data: product,
  });
}

async function deleteProduct(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const product = await productModel.findById(id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Only seller who created the product can delete
  if (product.seller.toString() !== req.user.id) {
    return res.status(403).json({ message: "not authorized" });
  }

  await productModel.findByIdAndDelete({ _id: id });

  return res.status(200).json({
    message: "successfully deleted",
  });
}

async function getProductsBySeller(req, res) {
  const sellerId = req.user.id;

  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "not authorized" });
  }

  const { q, minprice, maxprice, skip = 0, limit = 20 } = req.query;

  let filter = {};

  if (q) {
    filter.title = { $regex: q, $options: "i" };
  }

  if (minprice) {
    filter["price.amount"] = { $gte: Number(minprice) };
  }

  if (maxprice) {
    filter["price.amount"] = {
      ...filter["price.amount"],
      $lte: Number(maxprice),
    };
  }

  const products = await productModel
    .find({ seller: sellerId, ...filter })
    .skip(Number(skip))
    .limit(Math.min(Number(limit), 20));

  return res.status(200).json({
    data: products,
  });
}

async function searchProducts(req, res) {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      // fallback: return all if query empty
      const products = await productModel.find().limit(20);
      return res.status(200).json({
        message: "No search query provided. Showing all products.",
        data: products,
      });
    }

    const fuzzyEnabled = req.query.fuzzy === "true";

    const searchStage = {
      $search: {
        index: "default", // matches your Atlas index name
        text: {
          query,
          path: ["title", "description", "category"],
          fuzzy: fuzzyEnabled ? { maxEdits: 2, prefixLength: 1 } : undefined,
        },
      },
    };

    const results = await productModel.aggregate([searchStage, { $limit: 20 }]);

    return res.status(200).json({
      message: "Search completed successfully",
      data: results,
    });
  } catch (error) {
    console.error("❌ Search error:", error);
    res.status(500).json({ message: "Error performing search" });
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
  searchProducts,
};
