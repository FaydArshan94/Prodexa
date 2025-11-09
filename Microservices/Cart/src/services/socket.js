let io;
const connectedUsers = new Set();

const initializeSocket = (server) => {
  const socketIo = require("socket.io")(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  // Authentication middleware
  socketIo.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    // 🟡 Allow unauthenticated AI Buddy or system connections
    if (!token) {
      console.log("🟡 Allowing connection without token (AI Buddy or System)");
      return next();
    }

    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  // Handle connections
  socketIo.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.userId || "System/AI"}`);

    // If userId exists → join personal room
    if (socket.userId) {
      socket.join(socket.userId);
      connectedUsers.add(socket.userId);
    }

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.userId || "System/AI"}`);
      if (socket.userId) connectedUsers.delete(socket.userId);
    });
  });

  io = socketIo;
  return socketIo;
};

// 🔁 Emit event to all connected users every 5 seconds (for testing)
setInterval(() => {
  if (io && connectedUsers.size > 0) {
    for (const userId of connectedUsers) {
      console.log("🟢 Emitting cart:updated to user:", userId);
      io.to(userId).emit("cart:updated", {
        message: `Cart updated for user: ${userId}`,
      });
    }
  } else if (io) {
    // Global emit for system/AI tests
    console.log("🟢 Emitting cart:updated globally (no user connected)");
    io.emit("cart:updated", { message: "Global cart update (AI test)" });
  }
}, 5000);

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initializeSocket, getIO };
