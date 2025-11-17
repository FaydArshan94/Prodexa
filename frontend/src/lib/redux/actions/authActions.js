import { createAsyncThunk } from '@reduxjs/toolkit'
import * as authAPI from '@/lib/api/authApi'
import { clearUser } from '../slices/authSlice'

// Login Action
export const login = createAsyncThunk(
  '/api/auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authAPI.loginUser(credentials)
      return data
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

// Register Action
export const registerUser = createAsyncThunk(
  '/api/auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authAPI.registerUser(userData)
      return data
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed')
    }
  }
)

// Logout Action
export const logoutUser = createAsyncThunk(
  '/api/auth/logout',
  async (_, { dispatch, rejectWithValue }) => {   // ✅ get dispatch here
    try {
      await authAPI.logoutUser(); // optional API call
      dispatch(clearUser());      // ✅ correctly dispatch reducer
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);


// Fetch Current User Action
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authAPI.getCurrentUser()
      return data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ token, profileData }, { rejectWithValue }) => {
    try {
      const data = await authAPI.updateProfile(token, profileData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ token, passwordData }, { rejectWithValue }) => {
    try {
      const data = await authAPI.changePassword(token, passwordData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);
