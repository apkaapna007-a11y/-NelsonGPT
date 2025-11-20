import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Citation } from '../types';

interface CitationModalProps {
  citation: Citation;
  isOpen: boolean;
  onClose: () => void;
}

const CitationModal: React.FC<CitationModalProps> = ({ citation, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const first = modalRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }
  }, [isOpen]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }

    if (e.key === 'Tab' && modalRef.current) {
      const focusables = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="citation-title"
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 max-w-md mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 id="citation-title" className="text-lg font-semibold text-medical-charcoal">Citation Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Close citation details"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-medical-charcoal mb-1">{citation.chapter}</h3>
                  <p className="text-sm text-neutral-600">{citation.title}</p>
                </div>

                {citation.pageRange && (
                  <div>
                    <span className="text-sm font-medium text-neutral-700">Pages: </span>
                    <span className="text-sm text-neutral-600">{citation.pageRange}</span>
                  </div>
                )}

                {citation.excerpt && (
                  <div>
                    <span className="text-sm font-medium text-neutral-700 block mb-2">Excerpt:</span>
                    <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg italic">
                      "{citation.excerpt}"
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-neutral-700">Confidence:</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    citation.confidence === 'high' 
                      ? 'bg-green-100 text-green-700'
                      : citation.confidence === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {citation.confidence}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
                  View in Context
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CitationModal;

