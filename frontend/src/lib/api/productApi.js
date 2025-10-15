import { productApi } from './axiosConifg'

// Get all products with filters
// params: { q, minprice, maxprice, skip, limit }
export const getAllProducts = async (params = {}) => {
  try {
    const response = await productApi.get('/')
    return response.data // { message, data }
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch products' }
  }
}

// Get single product by ID
export const getProductById = async (id) => {
  try {
    const response = await productApi.get(`/${id}`)
    return response.data // { data: product }
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch product' }
  }
}

// Get seller's products (requires auth)
// params: { q, minprice, maxprice, skip, limit }
export const getSellerProducts = async (params = {}) => {
  try {
    const response = await productApi.get('/products/seller', { params })
    return response.data // { data: products }
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch seller products' }
  }
}

// Create product (seller/admin only, requires auth)
// productData: FormData with { title, description, priceAmount, priceCurrency, images[] }
export const createProduct = async (productData) => {
  try {
    const response = await productApi.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data // { message, data }
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create product' }
  }
}

// Update product (seller/admin only, requires auth)
// productData: FormData with updated fields
export const updateProduct = async (productId, productData) => {
  try {
    const response = await productApi.patch(`/products/${productId}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data // { message, data }
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update product' }
  }
}

// Delete product (seller only, requires auth)
export const deleteProduct = async (productId) => {
  try {
    const response = await productApi.delete(`/products/${productId}`)
    return response.data // { message }
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete product' }
  }
}