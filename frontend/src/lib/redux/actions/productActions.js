import { createAsyncThunk } from '@reduxjs/toolkit'
import * as productAPI from '@/lib/api/productApi'

// Fetch all products with filters
export const fetchProducts = createAsyncThunk(
  '/',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await productAPI.getAllProducts(params)
      return data.data // Return products array
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products')
    }
  }
)

// Fetch single product by ID
export const fetchProductById = createAsyncThunk(
  '/:id',
  async (id, { rejectWithValue }) => {
    try {
      const data = await productAPI.getProductById(id)
      return data.data // Return single product
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch product')
    }
  }
)

// Fetch seller's products (requires auth)
export const fetchSellerProducts = createAsyncThunk(
  'products/fetchSellerProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await productAPI.getSellerProducts(params)
      return data.data // Return seller's products array
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch seller products')
    }
  }
)

// Create product (seller/admin only)
export const createProduct = createAsyncThunk(
  'products/create',
  async (productData, { rejectWithValue }) => {
    try {
      const data = await productAPI.createProduct(productData)
      return data.data // Return created product
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create product')
    }
  }
)

// Update product (seller/admin only)
export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const data = await productAPI.updateProduct(productId, productData)
      return data.data // Return updated product
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update product')
    }
  }
)

// Delete product (seller only)
export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (productId, { rejectWithValue }) => {
    try {
      await productAPI.deleteProduct(productId)
      return productId // Return deleted product ID
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete product')
    }
  }
)