import { createSlice } from "@reduxjs/toolkit";
import {
  fetchProducts,
  fetchProductById,
  fetchSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../actions/productActions";

const initialState = {
  products: [],
  // sellerProducts: [],
  // currentProduct: null,
  isLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(searchProducts.fulfilled, (state, action) => {
        state.products = action.payload; // replace products with search results
        state.isLoading = false;
      })
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch seller products
      .addCase(fetchSellerProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sellerProducts = action.payload;
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // In productSlice.js - Keep it simple

      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        // Don't update state here - let the component refresh the data
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        // Don't update state here - let the component refresh the data
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        // Don't update state here - let the component refresh the data
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
