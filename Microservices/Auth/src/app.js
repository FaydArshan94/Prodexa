const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require("cors");


const authRouter = require('./routes/auth.routes');




const app = express();


app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:5173", "https://prodexa-tau.vercel.app"], // Frontend URLs
    credentials: true,
  })
);


app.use(cookieParser());
app.use(express.json());

// Add auth route
app.use('/api/auth', authRouter);

module.exports = app;