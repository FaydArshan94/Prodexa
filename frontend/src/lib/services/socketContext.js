'use client';

import { createContext, useContext } from 'react';

const SocketContext = createContext(undefined);

export function SocketProvider({ children }) {
  return (
    <SocketContext.Provider value={{}}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
