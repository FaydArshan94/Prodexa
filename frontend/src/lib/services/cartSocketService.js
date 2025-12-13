import { io } from "socket.io-client";
import { store } from "../redux/store";
import { fetchCart } from "../redux/actions/cartActions";

class CartSocketService {
  constructor() {
    this.socket = null;
    this.isInitialized = false;
  }

  initialize(token) {
    if (this.isInitialized || !token) return;

    // Use websocket only on production to avoid polling spam
    const transports = process.env.NODE_ENV === 'production' 
      ? ["websocket"] 
      : ["websocket", "polling"];

    this.socket = io("https://prodexa-cart.onrender.com", {
      auth: { token },
      transports,
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 30000,
      reconnectionAttempts: 3,
      enablesXDR: true,
      upgrade: false,
    });

    this.socket.on("connect", () => {
      console.log("✅ Cart Socket connected");
    });

    this.socket.on("connect_error", (err) => {
      console.warn("⚠️ Cart Socket error:", err?.message);
      // Stop reconnection attempts on auth errors
      if (err?.message?.includes("Invalid token")) {
        this.socket.disconnect();
        this.isInitialized = false;
      }
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Cart Socket disconnected");
    });

    this.socket.on("cart:updated", (data) => {
      store.dispatch(fetchCart());
    });

    this.isInitialized = true;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isInitialized = false;
    }
  }
}

export const cartSocketService = new CartSocketService();