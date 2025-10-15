const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const productRoutes = require("./routes/product.routes");

const app = express();



app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
  })
);


app.use(cookieParser());
app.use(express.json());

app.use("/api/products", productRoutes);

module.exports = app;
