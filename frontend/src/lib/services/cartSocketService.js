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
    });

    this.socket.on("connect_error", (err) => {
    });

    this.socket.on("cart:updated", (data) => {
      store.dispatch(fetchCart());
    });

    this.isInitialized = true;
  }
}

export const cartSocketService = new CartSocketService();
