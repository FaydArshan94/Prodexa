import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_SELLER_API || 'https://prodexa-seller-dashboard.onrender.com';

// Get Seller Metrics
export const getSellerMetrics = createAsyncThunk(
  'seller/getMetrics',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/seller/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch metrics');
    }
  }
);

// Get Seller Orders
export const getSellerOrders = createAsyncThunk(
  'seller/getOrders',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/seller/dashboard/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
      
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// Get Seller Products
export const getSellerProducts = createAsyncThunk(
  'seller/getProducts',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/seller/dashboard/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);