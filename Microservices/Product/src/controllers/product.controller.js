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

module.exports = { createProduct, getProducts, getProductById };
