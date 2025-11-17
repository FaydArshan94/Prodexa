"use client";

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { cartSocketService } from '../lib/services/cartSocketService';
import { aiSocketService } from '../lib/services/aiSocket';

export default function SocketInitializer() {
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (auth.token && auth.user) {
      cartSocketService.initialize(auth.token);
      aiSocketService.initialize(auth.token);
    }

    return () => {
      cartSocketService.disconnect();
      aiSocketService.disconnect();
    };
  }, [auth.token, auth.user]);

  return null; // This component doesn't render anything
}