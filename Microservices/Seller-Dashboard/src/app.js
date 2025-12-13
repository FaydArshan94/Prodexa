const express = require("express");
const cookieParser = require("cookie-parser")
const sellerRoutes = require("./routes/seller.routes.js");
const cors = require("cors");

const app = express();



app.use(
  cors({
      origin: ["http://localhost:5173", "https://prodexa-tau.vercel.app"], // Frontend URLs
      credentials: true,
    })
);


app.use(express.json());
app.use(cookieParser())




app.get("/", (req, res) => {
    res.send("Seller Dashboard Backend is running")
});

app.use("/api/seller/dashboard", sellerRoutes)



module.exports = app;
