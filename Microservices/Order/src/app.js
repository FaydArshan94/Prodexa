const express = require('express');
const orderRoutes = require('./routes/order.routes');
const cookiesParser = require('cookie-parser');
const cors = require('cors');


const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://prodexa-ten.vercel.app"], // Frontend URLs
    credentials: true,
  })
);



app.use(express.json());
app.use(cookiesParser());
app.use('/api/orders', orderRoutes);

module.exports = app;