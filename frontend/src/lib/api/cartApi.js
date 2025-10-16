import { cartApi } from "./axiosConifg";

export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await cartApi.post("/items", { productId, quantity });
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};


export const getCart = async () => {
  try {
    const response = await cartApi.get("/");
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};