const express = require("express");
const { connect } = require("./broker/broker");
const setListener = require("./broker/listener");

const app = express();

console.log('🚀 Starting Notification Service...');

// Connect to RabbitMQ and setup listeners
connect()
  .then(() => {
    console.log('✅ RabbitMQ connected, setting up listeners...');
    setListener();
  })
  .catch((error) => {
    console.error('❌ Failed to start notification service:', error);
    // Don't exit, keep retrying
  });

app.get("/", (req, res) => {
  res.json({
    message: "Notification service is up and running",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "notification",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = app;