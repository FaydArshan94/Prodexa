const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("../db/redis");
const { publishToQueue } = require("../broker/broker");

// Register a new user
async function registerUser(req, res) {
  try {
    const { username, email, password, fullName, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await userModel.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    // FIXED: Don't hash here - let the model's pre-save hook handle it
    const user = await userModel.create({
      username,
      email,
      password: password, // Pass plain password - model will hash it
      fullName: {
        firstName: fullName?.firstName || "",
        lastName: fullName?.lastName || "",
      },
      role: role || "user",
    });

    // publish events
    await publishToQueue("NOTIF_AUTH.USER_CREATED", {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
    });

    // JWT
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}


async function loginUser(req, res) {
  try {
    const { email, username, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await userModel
      .findOne({ $or: [{ email }, { username }] })
      .select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      console.error('User has no password in database:', user._id);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // FIXED: Use the model's comparePassword method consistently
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      message: "Login successful",
      token,
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
    return res.status(500).json({ message: "Server error", error: error.message });
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
    await redis.set(`blacklist_${token}`, "true", "EX", 24 * 60 * 60);
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
    const user = await userModel
      .findById(req.params.id)
      .select("username email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const {
      fullName: { firstName, lastName },
      email,
      username,
    } = req.body;
    const userId = req.user.id;

    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        { fullName: { firstName, lastName }, email, username },
        { new: true, runValidators: true }
      )
      .select("-password");

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("+password");

    if (!user || !user.password) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify current password using model method
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    // FIXED: Set plain password - pre-save hook will hash it
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: error.message });
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
  updateProfile,
  changePassword,
};