import React from 'react';
import { motion } from 'framer-motion';

const OfflineBanner: React.FC = () => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium z-50 safe-area-top"
    >
      <div className="flex items-center justify-center space-x-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>You're offline. Some features may be limited.</span>
      </div>
    </motion.div>
  );
};

export default OfflineBanner;

