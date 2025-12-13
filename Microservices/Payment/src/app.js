const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const paymentRoutes = require("./routes/payment.routes")

const app = express()

app.use(
  cors({
    origin: ["http://localhost:5173", "https://prodexa-ten.vercel.app"], // Frontend URLs
    credentials: true,
  })
);


app.use(express.json())
app.use(cookieParser())

app.use("/api/payments", paymentRoutes)

module.exports = app