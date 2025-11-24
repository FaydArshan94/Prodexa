import { createSlice } from '@reduxjs/toolkit';
import { getSellerMetrics, getSellerOrders, getSellerProducts } from '../actions/sellerActions';

const initialState = {
  metrics: {
    sales: 0,
    revenue: 0,
    topProducts: []
  },
  orders: [],
  products: [],
  isLoading: false,
  error: null
};

const sellerSlice = createSlice({
  name: 'seller',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Metrics
      .addCase(getSellerMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSellerMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload;
      })
      .addCase(getSellerMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Orders
      .addCase(getSellerOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSellerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getSellerOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Products
      .addCase(getSellerProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSellerProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(getSellerProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = sellerSlice.actions;
export default sellerSlice.reducer;