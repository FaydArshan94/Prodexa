import axios from 'axios'

// Base URLs for different services
export const API_URLS = {
  auth: process.env.NEXT_PUBLIC_AUTH_API || 'https://prodexa-auth.onrender.com',
  product: process.env.NEXT_PUBLIC_PRODUCT_API || 'https://prodexa-product.onrender.com/api/products',
  cart: process.env.NEXT_PUBLIC_CART_API || 'https://prodexa-cart.onrender.com/api/cart',
  order: process.env.NEXT_PUBLIC_ORDER_API || 'https://prodexa-order.onrender.com/api/orders',
  payment: process.env.NEXT_PUBLIC_PAYMENT_API || 'https://prodexa-payment.onrender.com/api/payments',
  notification: process.env.NEXT_PUBLIC_NOTIFICATION_API || 'http://localhost:3006',
  aiBuddy: process.env.NEXT_PUBLIC_AI_BUDDY_API || 'http://localhost:3007',
  seller: process.env.NEXT_PUBLIC_SELLER_API || 'http://localhost:3008',
}

// Create axios instances for each service
const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true, // Important for cookies!
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // You can add auth token here if needed
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      // Handle errors globally
      if (error.response?.status === 401) {
        // Unauthorized - redirect to login
        console.log('Unauthorized! Redirecting to login...')
        // window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// Export axios instances for each service
export const authApi = createAxiosInstance(API_URLS.auth)
export const productApi = createAxiosInstance(API_URLS.product)
export const cartApi = createAxiosInstance(API_URLS.cart)
export const orderApi = createAxiosInstance(API_URLS.order)
export const paymentApi = createAxiosInstance(API_URLS.payment)
export const notificationApi = createAxiosInstance(API_URLS.notification)
export const aiBuddyApi = createAxiosInstance(API_URLS.aiBuddy)
export const sellerApi = createAxiosInstance(API_URLS.seller)

export default authApi