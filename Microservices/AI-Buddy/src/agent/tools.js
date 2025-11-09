const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");
const { io } = require("../sockets/socket.server"); // adjust path if needed
const { io: Client } = require("socket.io-client");

// Connect to the Cart service socket (port 3002)
const cartSocket = Client(
  process.env.CART_SERVICE_URL || "http://localhost:3002",
  {
    reconnection: true,
    transports: ["websocket", "polling"],
  }
);

const searchProduct = tool(
  async ({ query }) => {
    try {
      const response = await axios.get(
        `${
          process.env.PRODUCT_SERVICE_URL || "http://localhost:3001"
        }/api/products/search`,
        {
          params: { q: query, limit: 5 },
        }
      );

      const products = response.data.data || [];

      if (products.length === 0) {
        return "No products found matching your search.";
      }

      // Return formatted product data for AI to use
      return JSON.stringify(
        products.map((p) => ({
          productId: p._id,
          title: p.title,
          price: p.price,
          image: p.images?.[0]?.url || "",
          stock: p.stock,
          discountPrice: p.discountPrice || p.price,
        }))
      );
    } catch (error) {
      console.error("Search product error:", error);
      return "Sorry, I couldn't search for products at the moment.";
    }
  },
  {
    name: "searchProduct",
    description:
      "Search for products by name, keyword, or category. Returns a list of products with their ID, title, price, image, stock, and discount price. Use this BEFORE adding products to cart.",
    schema: z.object({
      query: z.string().describe("Search term, product name, or keyword"),
    }),
  }
);

const addProductToCart = tool(
  async ({ productId, quantity = 1, product, token }) => {
    try {
      const response = await axios.post(
        `${
          process.env.CART_SERVICE_URL || "http://localhost:3002"
        }/api/cart/items`,
        { productId, quantity, product },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🔔 Realtime update
      if (cartSocket && cartSocket.connected) {
        console.log("🟢 Emitting cart:updated from AI Buddy");
        cartSocket.emit("cart:updated", {
          userId: "68da109598d6038fb573f2b5", // 👈 use the same userId
          message: `AI added ${product.title} to cart`,
        });
      }

      return `Successfully added ${product.title} (quantity: ${quantity}) to your cart!`;
    } catch (error) {
      console.error("Add to cart error:", error);
      return `Sorry, I couldn't add ${product.title} to your cart. ${
        error.response?.data?.message || ""
      }`;
    }
  },
  {
    name: "addProductToCart",
    description:
      "Add a product to the shopping cart. You must use searchProduct first to get the product details.",
    schema: z.object({
      productId: z.string().describe("The product ID from search results"),
      quantity: z.number().describe("Quantity to add").default(1),
      product: z
        .object({
          title: z.string().describe("Product title"),
          price: z.number().describe("Product price"),
          image: z.string().describe("Product image URL"),
          stock: z.number().describe("Available stock"),
          discountPrice: z.number().describe("Discounted price"),
        })
        .describe("Full product details from search results"),
    }),
  }
);

module.exports = {
  searchProduct,
  addProductToCart,
};
