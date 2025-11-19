import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useChatStore, useCommonQuestions } from '../store/chatStore';
import { ChatMode } from '../types';

const WelcomeScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<ChatMode>('academic');
  const { createNewChat, addMessage, setCurrentScreen } = useChatStore();
  const commonQuestions = useCommonQuestions();

  const handleSendMessage = () => {
    if (!query.trim()) return;

    const chatId = createNewChat(mode);
    addMessage(chatId, {
      content: query.trim(),
      role: 'user',
    });

    // Navigate to chat screen
    setCurrentScreen('chat');
    
    // Clear the input
    setQuery('');
  };

  const handleQuestionClick = (questionQuery: string) => {
    setQuery(questionQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-medical-ivory via-primary-50 to-white">
      {/* Header Icons */}
      <div className="absolute top-6 left-6 right-6 flex justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-neutral-600">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-neutral-600">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </motion.button>
      </div>

      {/* App Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-6"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl shadow-medical-lg flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M19 14a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 17V9a4 4 0 1 1 8 0v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center mb-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-medical-charcoal mb-2">
          Nelson-GPT
        </h1>
        <p className="text-lg md:text-xl text-neutral-600 mb-1">
          Pediatric Knowledge at Your Fingertips
        </p>
        <p className="text-sm md:text-base text-neutral-500">
          Inspired by the Nelson Textbook of Pediatrics
        </p>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md">
          <button
            onClick={() => setMode('clinical')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              mode === 'clinical'
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-neutral-600 hover:text-primary-600'
            }`}
          >
            Clinical
          </button>
          <button
            onClick={() => setMode('academic')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              mode === 'academic'
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-neutral-600 hover:text-primary-600'
            }`}
          >
            Academic
          </button>
        </div>
      </motion.div>

      {/* Hero Input Container */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="w-full max-w-2xl mx-auto mb-8"
      >
        <div className="bg-white rounded-3xl shadow-medical-lg p-8 relative">
          {/* Input Area */}
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                mode === 'clinical' 
                  ? "Ask a clinical question..." 
                  : "Ask about pediatric conditions, treatments, or guidelines..."
              }
              className="w-full min-h-[120px] resize-none border-none outline-none text-base md:text-lg text-medical-charcoal placeholder-neutral-400 bg-transparent"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            />
            
            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!query.trim()}
              className="absolute bottom-0 right-0 w-11 h-11 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center shadow-md transition-colors duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </div>

          {/* Mode Indicator */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${mode === 'clinical' ? 'bg-green-500' : 'bg-primary-500'}`} />
              <span className="text-sm text-neutral-500">
                {mode === 'clinical' ? 'Clinical Mode' : 'Academic Mode'}
              </span>
            </div>
            <span className="text-xs text-neutral-400">
              Press Enter to send, Shift+Enter for new line
            </span>
          </div>
        </div>
      </motion.div>

      {/* Common Questions */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="w-full max-w-2xl mx-auto"
      >
        <h2 className="text-lg font-semibold text-medical-charcoal text-center mb-6">
          Or try these common questions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonQuestions.map((question, index) => (
            <motion.button
              key={question.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuestionClick(question.query)}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-200 text-left group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{question.icon}</span>
                <div>
                  <h3 className="font-medium text-medical-charcoal group-hover:text-primary-600 transition-colors">
                    {question.title}
                  </h3>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-12 max-w-2xl mx-auto"
      >
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-amber-600 mt-0.5">
                <path d="M12 9v4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">Important:</p>
              <p className="text-sm text-amber-700">
                Nelson-GPT is designed to provide educational information for healthcare professionals. 
                Always verify information with current clinical guidelines and consult with experienced 
                colleagues for patient care decisions.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;

