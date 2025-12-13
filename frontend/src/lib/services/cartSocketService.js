import { io } from "socket.io-client";
import { store } from "../redux/store";
import { fetchCart } from "../redux/actions/cartActions";

class CartSocketService {
  constructor() {
    this.socket = null;
    this.isInitialized = false;
  }

  initialize(token) {
  if (this.socket || !token) return;

  this.socket = io("https://prodexa-cart.onrender.com", {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  });

  this.socket.on("connect", () => {
    console.log("✅ Cart Socket connected:", this.socket.id);
  });

  this.socket.on("disconnect", (reason) => {
    console.log("❌ Cart Socket disconnected:", reason);
  });

  this.socket.on("connect_error", (err) => {
    console.error("🚨 Cart socket error:", err.message);
    if (err.message.includes("Invalid token")) {
      this.disconnect();
    }
  });

  this.socket.on("cart:updated", () => {
    store.dispatch(fetchCart());
  });
}


  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isInitialized = false;
    }
  }
}

export const cartSocketService = new CartSocketService();