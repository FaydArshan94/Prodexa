"use client";

import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { useEffect } from "react";
import { cartSocketService } from "@/lib/services/cartSocketService";

function CartSocketInitializer() {
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (auth?.isAuthenticated && auth?.token) {
      console.log("🔄 Reconnecting socket...");
      cartSocketService.initialize(auth.token);
    }

    return () => {
      cartSocketService.disconnect();
    };
  }, [auth?.isAuthenticated, auth?.token]);

  return null;
}

export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <CartSocketInitializer />
        {children}
      </PersistGate>
    </Provider>
  );
}