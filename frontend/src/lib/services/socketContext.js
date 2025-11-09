"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (!auth.token || !auth.user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to cart service
    const newSocket = io(
      'http://localhost:3002',
      {
        auth: {
          token: auth.token
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      }
    );

    newSocket.on('connect', () => {
      console.log('✅ Connected to cart service');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [auth.token, auth.user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}