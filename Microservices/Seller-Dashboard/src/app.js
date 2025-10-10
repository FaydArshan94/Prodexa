const express = require("express");
const cookieParser = require("cookie-parser")
const sellerRoutes = require("./routes/seller.routes.js");

const app = express();

app.use(express.json());
app.use(cookieParser())


app.get("/", (req, res) => {
    res.send("Seller Dashboard Backend is running")
});

app.use("/api/seller/dashboard", sellerRoutes)



module.exports = app;
