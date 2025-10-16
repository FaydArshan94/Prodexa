import { createSlice } from '@reduxjs/toolkit'
import { addToCart, fetchCart, removeFromCart } from '../actions/cartActions'

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
    updateQuantityOptimistic: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.cart.find(item => item.productId === productId);
      if (item) {
        item.quantity = quantity;
        // Update totals
        state.totals.totalQuantity = state.cart.reduce((sum, item) => sum + item.quantity, 0);
      }
    },
    removeItemOptimistic: (state, action) => {
      const { productId } = action.payload;
      state.cart = state.cart.filter(item => item.productId !== productId);
      // Update totals
      state.totals.itemCount = state.cart.length;
      state.totals.totalQuantity = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
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
          state.isLoading = false;
          state.error = action.error.message;
        })


        .addCase(fetchCart.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(fetchCart.fulfilled, (state, action) => {
          state.isLoading = false;
          // Check if payload and cart exist before accessing items
          if (action.payload && action.payload.cart) {
            state.cart = action.payload.cart.items;
            state.totals = action.payload.totals;
          } else {
            // Handle the case where the expected data structure is missing
            state.error = "Invalid payload received for cart.";
          }
        })
        .addCase(fetchCart.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        })


        .addCase(removeFromCart.pending, (state) => {
          state.isLoading = true
        })
        .addCase(removeFromCart.fulfilled, (state, action) => {
          state.isLoading = false
          if (action.payload && action.payload.cart) {
            state.cart = action.payload.cart.items
            state.totals = action.payload.totals
          } else {
            state.error = "Invalid payload received for cart removal."
          }
        })
        .addCase(removeFromCart.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        })

    },
})

export const { clearError, updateQuantityOptimistic, removeItemOptimistic } = cartSlice.actions
export default cartSlice.reducer