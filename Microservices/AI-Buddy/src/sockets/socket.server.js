// socketServer.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const agent = require("../agent/agent");
const { io: Client } = require("socket.io-client");
let io; // store io globally

async function initSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const cookies = socket.handshake.headers?.cookie;
    const { token } = cookies ? cookie.parse(cookies) : {};
    if (!token) return next(new Error("Token not provided"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      socket.token = token;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ AI socket connected:", socket.user);

    socket.on("user:message", async (data) => {
      console.log("📨 Received AI user message:", data);

      socket.emit("ai:typing", true);

      const agentResponse = await agent.invoke(
        {
          messages: [{ role: "user", content: data }],
        },
        { metadata: { token: socket.token } }
      );

      const lastMessage =
        agentResponse.messages[agentResponse.messages.length - 1];

      socket.emit("ai:message", lastMessage.content);
      socket.emit("ai:typing", false);
    });

    
  });


  const cartSocket = Client("http://localhost:3002", {
      transports: ["websocket"],
    });

    cartSocket.on("connect", () =>
      console.log("🟢 AI Buddy connected to Cart socket")
    );
    cartSocket.on("connect_error", (err) =>
      console.error("❌ AI-Cart socket error:", err.message)
    );

    setTimeout(() => {
      console.log("🟢 AI emitting cart:updated from AI Buddy...");
      cartSocket.emit("cart:updated", { msg: "From AI Buddy test" });
    }, 5000);
}

module.exports = { initSocketServer, io };
