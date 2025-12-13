import { io } from 'socket.io-client';
import { store } from '../redux/store';
import { addMessage, setConnectionStatus, setTypingStatus } from '../redux/features/aiChatSlice';

class AISocketService {
  constructor() {
    this.socket = null;
    this.isInitialized = false;
  }

  initialize(token) {
    if (this.isInitialized || !token) return;

    // Use websocket only on production to avoid polling spam
    const transports = process.env.NODE_ENV === 'production' 
      ? ["websocket"] 
      : ["websocket", "polling"];

    this.socket = io(process.env.NEXT_PUBLIC_AI_BUDDY_URL, {
      auth: { token },
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionAttempts: 3,
      transports,
      reconnectionDelayMax: 30000,
      upgrade: false,
      enablesXDR: true,
      path: '/socket.io/',
    });

    this.socket.on('connect', () => {
      console.log('✅ AI Socket connected');
      store.dispatch(setConnectionStatus(true));
    });

    this.socket.on('disconnect', () => {
      console.log('❌ AI Socket disconnected');
      store.dispatch(setConnectionStatus(false));
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 AI Socket connection error:', error?.message || error);
      store.dispatch(setConnectionStatus(false));
    });

    this.socket.on('ai:message', (message) => {
      store.dispatch(addMessage({
        role: 'assistant',
        content: message,
        timestamp: new Date().toISOString(),
      }));
    });

    this.socket.on('ai:typing', (isTyping) => {
      store.dispatch(setTypingStatus(isTyping));
    });

    this.isInitialized = true;
  }

  sendMessage(message) {
    if (!this.socket) return;
    
    store.dispatch(addMessage({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }));

    this.socket.emit('user:message', message);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isInitialized = false;
    }
  }
}

export const aiSocketService = new AISocketService();