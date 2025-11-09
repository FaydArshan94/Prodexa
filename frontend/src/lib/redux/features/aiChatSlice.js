import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  isConnected: false,
  isTyping: false,
};

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    setTypingStatus: (state, action) => {
      state.isTyping = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, setConnectionStatus, setTypingStatus, clearMessages } = aiChatSlice.actions;
export default aiChatSlice.reducer;