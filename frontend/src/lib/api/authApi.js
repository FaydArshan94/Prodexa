import { authApi } from './axiosConifg'

// Register User (Customer or Seller)
export const registerUser = async (userData) => {
  try {
    const response = await authApi.post('/api/auth/register', userData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' }
  }
}

// Login User (Customer or Seller)
export const loginUser = async (credentials) => {
  try {
    const response = await authApi.post('/api/auth/login', credentials)
    return response.data
  } catch (error) {
    // Log the full error for debugging
    console.error('Login error:', error);
    // Throw a more detailed error message
    throw error.response?.data || { 
      message: `Login failed: ${error.message || 'Unknown error'}`,
      status: error.response?.status
    }
  }
}

// Logout User
export const logoutUser = async () => {
  try {
    const response = await authApi.get('/api/auth/logout')
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Logout failed' }
  }
}

// Get Current User (from token/cookie)
export const getCurrentUser = async () => {
  try {
    const response = await authApi.get('/api/auth/me')
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user' }
  }
}

// Refresh Token (if needed)
export const refreshToken = async () => {
  try {
    const response = await authApi.post('/auth/refresh')
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Token refresh failed' }
  }
}



export const updateProfile = async (token, profileData) => {
   try {
    const response = await authApi.put('/api/auth/users/me/profile', profileData, )
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' }
  }
};

export const changePassword = async (token, passwordData) => {
  try {
    const response = await authApi.put('/api/auth/users/me/password', passwordData, )
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to change password' }
  }
}