// socketServer.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const agent = require("../agent/agent");
const { HumanMessage } = require("@langchain/core/messages");
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
    // Try to get token from auth object first (socket.io-client sends it here)
    let token = socket.handshake.auth?.token;
    
    // Fall back to cookies if not in auth
    if (!token) {
      const cookies = socket.handshake.headers?.cookie;
      const parsed = cookies ? cookie.parse(cookies) : {};
      token = parsed.token;
    }
    
    if (!token) {
      console.error("❌ No token found in handshake");
      return next(new Error("Token not provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      socket.token = token;
      console.log("✅ Token verified for user:", decoded.id);
      next();
    } catch (error) {
      console.error("❌ Token verification failed:", error.message);
      next(new Error(`Invalid token: ${error.message}`));
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ AI socket connected:", socket.user);

    socket.on("user:message", async (data) => {
      console.log("📨 Received AI user message:", data);

      try {
        socket.emit("ai:typing", true);

        const agentResponse = await agent.invoke(
          {
            messages: [new HumanMessage({ content: data })],
          },
          { metadata: { token: socket.token } }
        );

        const lastMessage =
          agentResponse.messages[agentResponse.messages.length - 1];

        console.log("🤖 Agent response:", lastMessage);

        socket.emit("ai:message", lastMessage.content);
        socket.emit("ai:typing", false);
      } catch (error) {
        console.error("❌ Error in agent processing:", error.message);
        socket.emit("ai:message", `Sorry, I encountered an error: ${error.message}`);
        socket.emit("ai:typing", false);
      }
    });

    
  });


  const cartSocket = Client("https://prodexa-cart.onrender.com", {
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
