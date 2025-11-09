"use client";

import { Provider, useSelector } from "react-redux";
import { store } from "./store";
import { useEffect } from "react";
import { cartSocketService } from "@/lib/services/cartSocketService";

function CartSocketInitializer() {
  const auth = useSelector((state) => state.auth);

  useEffect(() => {

    if (auth?.isAuthenticated && auth?.token) {
      cartSocketService.initialize(auth.token);
    }
  }, [auth?.isAuthenticated, auth?.token]);

  return null;
}

export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <CartSocketInitializer />
      {children}
    </Provider>
  );
}
