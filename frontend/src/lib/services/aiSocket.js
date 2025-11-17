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

    this.socket = io(process.env.NEXT_PUBLIC_AI_BUDDY_URL, {
      auth: { token },
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      store.dispatch(setConnectionStatus(true));
    });

    this.socket.on('disconnect', () => {
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