require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");
const http = require('http');
const { initializeSocket } = require('./src/services/socket');

connectDB();


const server = http.createServer(app);
initializeSocket(server);


server.listen(3002, () => {
  console.log(`Cart service running on port 3002`);
  console.log('Socket.IO initialized ✅');
});