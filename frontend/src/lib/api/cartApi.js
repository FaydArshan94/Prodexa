import axios from "axios";
import { cartApi } from "./axiosConifg";

export const addToCart = async (cartData) => {
  const response = await cartApi.post("/items", cartData);
  return response.data;
};

export const getCart = async () => {
  const response = await cartApi.get("/");
  return response.data;
};


export const updateCartQuantity = async (productId, quantity) => {
  const response = await cartApi.patch(`/items/${productId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await cartApi.delete(`/items/${productId}`);
  return response.data;
};