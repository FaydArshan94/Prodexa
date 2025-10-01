const productModel = require("../models/product.model");
const { uploadImage } = require("../services/imagekit.service");
const mongoose = require("mongoose");

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
  const { q, minprice, maxprice, skip = 0, limit = 20 } = req.query;

  const filter = {};

  if (q) {
    filter.$text = { $search: q };
  }

  if (minprice) {
    filter["price.amount"] = {
      ...filter["price.amount"],
      $gte: Number(minprice),
    };
  }

  if (maxprice) {
    filter["price.amount"] = {
      ...filter["price.amount"],
      $lte: Number(maxprice),
    };
  }

  const products = await productModel
    .find(filter)
    .skip(skip)
    .limit(Math.min(limit, 20));

  return res.status(200).json({
    message: "Products retrieved",
    data: products,
  });
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

  return res.status(200).json({
    data: product,
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
    return res
      .status(403)
      .json({ message: "not authorized" });
  }

  await productModel.findByIdAndDelete({_id: id});

  return res.status(200).json({
    message: "successfully deleted",
  });
}

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
