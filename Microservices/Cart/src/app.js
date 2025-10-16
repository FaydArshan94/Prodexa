const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cartRoutes = require("./routes/cart.routes");


const app = express();


app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
  })
);



app.use(express.json());
app.use(cookieParser());

app.use("/api/cart", cartRoutes);

module.exports = app;
