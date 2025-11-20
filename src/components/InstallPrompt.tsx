import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chatStore';

const InstallPrompt: React.FC = () => {
  const { showInstallPrompt, installPromptEvent, hideInstallPrompt } = useChatStore();

  const handleInstall = async () => {
    if (installPromptEvent && typeof installPromptEvent.prompt === 'function') {
      installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      hideInstallPrompt();
    }
  };

  const handleDismiss = () => {
    hideInstallPrompt();
  };

  return (
    <AnimatePresence>
      {showInstallPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          role="dialog"
          aria-modal="true"
          aria-label="Install Nelson-GPT"
          className="fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 z-40"
        >
          <div className="flex items-start space-x-4">
            {/* App Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M19 14a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 17V9a4 4 0 1 1 8 0v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-medical-charcoal mb-1">
                Install Nelson-GPT
              </h3>
              <p className="text-sm text-neutral-600 mb-3">
                Add Nelson-GPT to your home screen for quick access and offline use.
              </p>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-neutral-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Dismiss install prompt"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
