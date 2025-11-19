import React from 'react';
import { motion } from 'framer-motion';
import { useChatStore, useCurrentChat } from '../store/chatStore';

const ChatInterface: React.FC = () => {
  const currentChat = useCurrentChat();
  const { setCurrentScreen } = useChatStore();

  if (!currentChat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-neutral-600 mb-4">No active chat found</p>
          <button
            onClick={() => setCurrentScreen('welcome')}
            className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
          >
            Start New Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-medical-ivory pb-20"
    >
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-4 safe-area-top">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('welcome')}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <h1 className="text-lg font-semibold text-medical-charcoal truncate mx-4">
            {currentChat.title}
          </h1>
          
          <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
              <circle cx="19" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
              <circle cx="5" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 px-4 py-6">
        {currentChat.messages.length === 0 ? (
          <div className="text-center text-neutral-500 mt-20">
            <p>Start your conversation with Nelson-GPT</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentChat.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary-100 text-medical-charcoal rounded-tr-md'
                      : 'bg-white border border-neutral-200 text-medical-charcoal rounded-tl-md'
                  }`}
                >
                  <p className="text-sm md:text-base">{message.content}</p>
                  <p className="text-xs text-neutral-500 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Dock - Placeholder */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-neutral-200 p-4">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatInterface;

