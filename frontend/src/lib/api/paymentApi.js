import { paymentApi } from './axiosConifg'

/**
 * Create a payment for an order
 * @param {string} orderId - The order ID
 * @returns {Promise} Payment data
 */
export const createPayment = async (orderId) => {
  try {
    const response = await paymentApi.post(`/create/${orderId}`, {})
    return response.data
  } catch (error) {
    console.error('Create payment error:', error)
    throw error.response?.data || { message: 'Failed to create payment' }
  }
}

/**
 * Verify a Razorpay payment
 * @param {Object} verificationData - Payment verification data
 * @returns {Promise} Verification result
 */
export const verifyPayment = async (verificationData) => {
  try {
    const response = await paymentApi.post('/verify', verificationData)
    return response.data
  } catch (error) {
    console.error('Verify payment error:', error)
    throw error.response?.data || { message: 'Failed to verify payment' }
  }
}

