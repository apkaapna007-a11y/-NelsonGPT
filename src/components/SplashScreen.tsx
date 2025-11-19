import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SplashScreen: React.FC = () => {
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showDots, setShowDots] = useState(false);

  useEffect(() => {
    // Stagger the animations
    const titleTimer = setTimeout(() => setShowTitle(true), 500);
    const subtitleTimer = setTimeout(() => setShowSubtitle(true), 1500);
    const dotsTimer = setTimeout(() => setShowDots(true), 2000);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(subtitleTimer);
      clearTimeout(dotsTimer);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-medical-ivory via-primary-50 to-white px-6">
      {/* App Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
          type: "spring",
          stiffness: 100
        }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl shadow-medical-lg flex items-center justify-center">
          {/* Stethoscope Icon */}
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="text-white"
          >
            <path 
              d="M19 14a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M16 17v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M8 17V9a4 4 0 1 1 8 0v8" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <circle 
              cx="12" 
              cy="5" 
              r="2" 
              stroke="currentColor" 
              strokeWidth="2"
            />
          </svg>
        </div>
      </motion.div>

      {/* App Title with Typing Animation */}
      <div className="text-center mb-4">
        {showTitle && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold text-medical-charcoal mb-2"
          >
            <span className="inline-block overflow-hidden whitespace-nowrap border-r-2 border-primary-500 typing-animation">
              Nelson-GPT
            </span>
          </motion.h1>
        )}
      </div>

      {/* Subtitle */}
      {showSubtitle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <p className="text-xl md:text-2xl text-neutral-600 font-medium mb-2">
            Pediatric Knowledge at Your Fingertips
          </p>
          <p className="text-base md:text-lg text-neutral-500">
            Inspired by the Nelson Textbook of Pediatrics
          </p>
        </motion.div>
      )}

      {/* Loading Dots */}
      {showDots && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex space-x-2"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-primary-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Version Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.5 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-sm text-neutral-400">
          Version 1.0.0 • Evidence-Based Pediatric Assistant
        </p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;

