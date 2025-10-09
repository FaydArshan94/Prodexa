const express = require("express");
const { connect, subscribeToQueue } = require("./broker/broker");

const  setListener  = require("./broker/listener");

const app = express();
connect().then(()=>[
  setListener()
]);

app.get("/", (req, res) => {
  res.send("Notification service is up and running");
});

module.exports = app;
