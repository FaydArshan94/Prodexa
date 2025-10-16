import { createSlice } from '@reduxjs/toolkit'
import { addToCart, fetchCart } from '../actions/cartActions'

const initialState = {
  cart: [],
  totals: {
    itemCount: 0,
    totalQuantity: 0
  },
  isLoading: false,
  error: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
    reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentCart: (state) => {
      state.cart = []
    },
  },
    extraReducers: (builder) => {
      builder
        .addCase(addToCart.pending, (state) => {
          state.isLoading = true
        })
        .addCase(addToCart.fulfilled, (state, action) => {
          state.isLoading = false
          state.cart = action.payload.cart.items
          state.totals = action.payload.totals
        })
        .addCase(addToCart.rejected, (state, action) => {
          state.isLoading = false
          state.error = action.error.message
        })


        .addCase(fetchCart.pending, (state) => {
          state.isLoading = true
        })
        .addCase(fetchCart.fulfilled, (state, action) => {
          state.isLoading = false
          state.cart = action.payload.cart.items
          state.totals = action.payload.totals
        })
        .addCase(fetchCart.rejected, (state, action) => {
          state.isLoading = false
          state.error = action.error.message
        })
    },
})

export const { clearError } = cartSlice.actions
export default cartSlice.reducer