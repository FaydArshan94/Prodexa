import { createSlice } from '@reduxjs/toolkit'
import {
  fetchProducts,
  fetchProductById,
  fetchSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../actions/productActions'

const initialState = {
  products: [],
  // sellerProducts: [],
  // currentProduct: null,
  // isLoading: false,
  // error: null,
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentProduct = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch seller products
      .addCase(fetchSellerProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.sellerProducts = action.payload
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.sellerProducts.push(action.payload)
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.sellerProducts.findIndex(p => p._id === action.payload._id)
        if (index !== -1) {
          state.sellerProducts[index] = action.payload
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.sellerProducts = state.sellerProducts.filter(p => p._id !== action.payload)
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentProduct } = productSlice.actions
export default productSlice.reducer