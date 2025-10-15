import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productsReducer from "./slices/productSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    // cart: cartReducer,
    // orders: ordersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
