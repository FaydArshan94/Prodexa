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

    this.socket = io("http://localhost:3002", {
      auth: { token }, // 👈 pass JWT here
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("✅ Connected to Cart Service Socket");
    });

    this.socket.on("connect_error", (err) => {
      console.error("❌ Cart socket error:", err.message);
    });

    this.socket.on("cart:updated", (data) => {
      console.log("🔔 Cart updated in real-time:", data);
      store.dispatch(fetchCart());
    });

    this.isInitialized = true;
  }
}

export const cartSocketService = new CartSocketService();
