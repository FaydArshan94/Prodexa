const mongoose = require("mongoose");

async function connectDB() {
  // Skip connection in test environment
  if (process.env.NODE_ENV === 'test') {
    console.log("Skipping MongoDB connection in test environment");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

module.exports = connectDB;