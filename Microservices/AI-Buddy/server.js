require("dotenv").config();

// Validate required environment variables
const requiredEnvVars = ["GOOGLE_API_KEY", "JWT_SECRET"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

console.log("✅ All required environment variables are set");

const app = require("./src/app");
const http = require("http");
const {initSocketServer} = require("./src/sockets/socket.server");

const httpServer = http.createServer(app);
initSocketServer(httpServer);

httpServer.listen(3005, () => {
  console.log("Server is running on port 3005");
});