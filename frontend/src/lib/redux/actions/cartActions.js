import { createAsyncThunk } from "@reduxjs/toolkit";
import * as cartApi from "@/lib/api/cartApi";

export const addToCart = createAsyncThunk("/items", async (productId) => {
  const response = await cartApi.addToCart(productId, 1);

  return response;
});

export const fetchCart = createAsyncThunk("/", async () => {
  const response = await cartApi.getCart();

  return response;
});
