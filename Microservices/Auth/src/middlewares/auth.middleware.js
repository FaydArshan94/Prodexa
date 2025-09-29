const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

// Middleware to protect routes
async function authMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables");
    return res.status(500).json({ message: "Internal server error" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      if (error.message === 'invalid signature') {
        return res.status(401).json({ message: "Token signature is invalid" });
      }
      return res.status(401).json({ message: "Invalid token format" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token has expired" });
    }
    
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
}

module.exports = { authMiddleware };
