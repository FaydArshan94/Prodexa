const express = require("express");
const { connect } = require("./broker/broker");
const setListener = require("./broker/listener");

const app = express();

console.log('🚀 Starting Notification Service...');
console.log('⏰ Timestamp:', new Date().toISOString());

let listenerSetup = false;

// Function to setup listeners with retry
async function setupListeners() {
  try {
    if (!listenerSetup) {
      console.log('✅ RabbitMQ connected, setting up listeners...');
      setListener();
      listenerSetup = true;
    }
  } catch (error) {
    console.error('❌ Failed to setup listeners:', error.message);
    // Retry in 10 seconds
    setTimeout(setupListeners, 10000);
  }
}

// Connect to RabbitMQ and setup listeners
connect()
  .then(() => setupListeners())
  .catch((error) => {
    console.error('❌ Initial connection attempt failed:', error.message);
    console.log('🔄 Will keep retrying...');
    // Retry every 10 seconds
    setInterval(async () => {
      try {
        await connect();
        if (!listenerSetup) {
          await setupListeners();
        }
      } catch (err) {
        console.error('❌ Retry attempt failed:', err.message);
      }
    }, 10000);
  });

app.get("/", (req, res) => {
  res.json({
    message: "Notification service is up and running",
    status: "healthy",
    timestamp: new Date().toISOString(),
    listenersActive: listenerSetup
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "notification",
    uptime: process.uptime(),
    listenersActive: listenerSetup,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;