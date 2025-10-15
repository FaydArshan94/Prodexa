const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("../db/redis");
const { publishToQueue } = require("../broker/broker");

// Register a new user
async function registerUser(req, res) {
  const {
    username,
    email,
    password,
    fullName: { firstName, lastName },
    role,
  } = req.body;

  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserAlreadyExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: hash,
    fullName: { firstName, lastName },
    role: role || "user",
  });

  await Promise.all([
    publishToQueue("AUTH_NOTIFICATION.USER_CREATED", {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
    }),

    publishToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", user),
  ]);

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      adresses: user.addresses,
    },
  });
}

async function loginUser(req, res) {
  try {
    const { email, username, password } = req.body;
    const user = await userModel
      .findOne({ $or: [{ email }, { username }] })
      .select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getCurrentUser(req, res) {
  return res.status(200).json({
    message: "Current user fetched successfully",
    user: req.user,
  });
}

async function logoutUser(req, res) {
  const token = req.cookies.token;

  if (token) {
    await redis.set(`blacklist_${token}`, "true", "EX", 24 * 60 * 60); // 1 day expiration
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
  });
  return res.status(200).json({ message: "Logout successful" });
}

async function getUserAddresses(req, res) {
  const userId = req.user.id;

  const user = await userModel.findById(userId).select("addresses");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({
    message: "User addresses fetched successfully",
    addresses: user.addresses,
  });
}

async function addUserAddress(req, res) {
  const userId = req.user.id;
  const { street, city, state, pincode, country, isDefault } = req.body;

  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (pincode.length !== 5 || !/^\d{5}$/.test(pincode)) {
    return res.status(400).json({ message: "Invalid pincode format" });
  }

  user.addresses.push({ street, city, state, pincode, country, isDefault });
  await user.save();

  return res.status(201).json({
    message: "Address added successfully",
    address: user.addresses[user.addresses.length - 1],
  });
}

async function deleteUserAddress(req, res) {
  const userId = req.user.id;
  const { addressId } = req.params;

  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }

  user.addresses = user.addresses.filter(
    (addr) => addr._id.toString() !== addressId
  );
  await user.save();

  return res.status(200).json({
    message: "Address deleted successfully",
    addresses: user.addresses,
  });
}

async function getUserById(req, res) {
  try {
    const user = await userModel.findById(req.params.id).select("username email"); // Public fields only

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  getUserById,
  addUserAddress,
  getUserAddresses,
  deleteUserAddress,
};
