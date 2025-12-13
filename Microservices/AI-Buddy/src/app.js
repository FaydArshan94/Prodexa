const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://prodexa-tau.vercel.app"], // Frontend URLs
    credentials: true,
  })
);

app.use(express.json());


module.exports = app;