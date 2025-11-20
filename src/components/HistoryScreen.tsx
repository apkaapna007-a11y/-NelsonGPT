import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useChatStore, useChats } from '../store/chatStore';
import { formatDistanceToNow } from 'date-fns';

const HistoryScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const chats = useChats();
  const { setCurrentChatId, setCurrentScreen, deleteChat, searchChats } = useChatStore();

  const filteredChats = searchQuery.trim() ? searchChats(searchQuery) : chats;

  const handleChatClick = (chatId: string) => {
    setCurrentChatId(chatId);
    setCurrentScreen('chat');
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-medical-ivory pb-20"
    >
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-4 safe-area-top">
        <h1 className="text-xl font-bold text-medical-charcoal text-center">
          Chat History
        </h1>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            aria-label="Search conversations"
            className="w-full px-4 py-3 pl-12 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400"
          >
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="px-4">
        {filteredChats.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-neutral-500 text-lg mb-2">
              {searchQuery.trim() ? 'No chats found' : 'No chat history yet'}
            </p>
            <p className="text-neutral-400 text-sm">
              {searchQuery.trim() 
                ? 'Try a different search term' 
                : 'Start a conversation to see it here'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleChatClick(chat.id)}
                className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Chat Title */}
                    <h3 className="font-medium text-medical-charcoal group-hover:text-primary-600 transition-colors truncate">
                      {chat.title}
                    </h3>
                    
                    {/* Last Message Preview */}
                    {chat.messages.length > 0 && (
                      <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                        {chat.messages[chat.messages.length - 1].content}
                      </p>
                    )}
                    
                    {/* Metadata */}
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-xs text-neutral-400">
                        {formatDistanceToNow(chat.updatedAt, { addSuffix: true })}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        chat.mode === 'clinical' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-primary-100 text-primary-700'
                      }`}>
                        {chat.mode}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="ml-3 p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    aria-label="Delete chat"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HistoryScreen;

