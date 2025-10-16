import { createAsyncThunk } from "@reduxjs/toolkit";
import * as cartApi from "../../api/cartApi";

export const addToCart = createAsyncThunk(
  "/items",
  async (cartData, { rejectWithValue }) => {
    try {
      const response = await cartApi.addToCart(cartData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed");
    }
  }
);

export const fetchCart = createAsyncThunk(
  "/",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.getCart();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed");
    }
  }
);

export const updateQuantity = createAsyncThunk(
  "/items:/productId",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartApi.updateCartQuantity(productId, quantity);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed");
    }
  }
);



export const removeFromCart = createAsyncThunk(
  '/items/:productId',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await cartApi.removeFromCart(productId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed');
    }
  }
);