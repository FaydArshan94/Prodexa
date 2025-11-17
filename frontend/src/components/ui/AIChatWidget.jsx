'use client';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronUpIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { aiSocketService } from '@/lib/services/aiSocket';
import { clearMessages } from '@/lib/redux/features/aiChatSlice';

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth);

  
  const { messages, isConnected, isTyping } = useSelector((state) => state.aiChat);

  useEffect(() => {
    if (isOpen && !aiSocketService.isInitialized) {
      aiSocketService.initialize();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    aiSocketService.sendMessage(message.trim());
    setMessage('');
  };

  const handleClose = () => {
    setIsOpen(false);
    dispatch(clearMessages());
    aiSocketService.disconnect();
  };



  if(!auth.isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors"
        >
          <ChevronUpIcon className="h-6 w-6" />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-96 h-[500px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">AI Assistant</h3>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="bg-primary text-white p-2 rounded-lg disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}