import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore, usePreferences } from '../store/chatStore';
import { UserPreferences, Theme, FontSize, ColorPalette } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const preferences = usePreferences();
  const { updatePreferences, clearAllChats } = useChatStore();

  const handlePreferenceChange = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    updatePreferences({ [key]: value });
  };

  const colorPalettes = [
    { id: 'amber' as ColorPalette, name: 'Amber', color: '#F59E0B' },
    { id: 'blue' as ColorPalette, name: 'Blue', color: '#3B82F6' },
    { id: 'orange' as ColorPalette, name: 'Orange', color: '#F97316' },
    { id: 'gray' as ColorPalette, name: 'Gray', color: '#6B7280' },
  ];

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Settings Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-white border-b border-neutral-200 px-6 py-4 safe-area-top">
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <h1 className="text-xl font-bold text-medical-charcoal">Settings</h1>
                <div className="w-9" /> {/* Spacer */}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-8">
              {/* Appearance Section */}
              <div>
                <h2 className="text-lg font-semibold text-medical-charcoal mb-4">Appearance</h2>
                
                {/* Theme */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-medical-charcoal mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['light', 'dark', 'system'] as Theme[]).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => handlePreferenceChange('theme', theme)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                          preferences.theme === theme
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          {theme === 'light' && (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary-500">
                              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          )}
                          {theme === 'dark' && (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary-500">
                              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          )}
                          {theme === 'system' && (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary-500">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                              <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          )}
                          <span className="text-sm font-medium capitalize">{theme}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-medical-charcoal mb-3">
                    Font Size
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="1"
                      value={['small', 'medium', 'large'].indexOf(preferences.fontSize)}
                      onChange={(e) => {
                        const sizes: FontSize[] = ['small', 'medium', 'large'];
                        handlePreferenceChange('fontSize', sizes[parseInt(e.target.value)]);
                      }}
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-neutral-500 mt-2">
                      <span>Small</span>
                      <span>Large</span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-sm text-primary-600 font-medium">
                        Current size: {preferences.fontSize === 'small' ? '14px' : preferences.fontSize === 'medium' ? '16px' : '18px'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Color Palette */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-medical-charcoal mb-3">
                    Color Palette
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {colorPalettes.map((palette) => (
                      <button
                        key={palette.id}
                        onClick={() => handlePreferenceChange('colorPalette', palette.id)}
                        className={`aspect-square rounded-xl border-2 transition-all duration-200 ${
                          preferences.colorPalette === palette.id
                            ? 'border-neutral-400 scale-110'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                        style={{ backgroundColor: palette.color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Behavior Section */}
              <div>
                <h2 className="text-lg font-semibold text-medical-charcoal mb-4">AI Behavior</h2>
                <p className="text-sm text-neutral-600 mb-6">
                  Customize how Nelson-GPT responds to your questions
                </p>

                {/* Toggle Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-medical-charcoal">Detailed Responses</h3>
                      <p className="text-sm text-neutral-600">Include comprehensive explanations</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('detailedResponses', !preferences.detailedResponses)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.detailedResponses ? 'bg-primary-500' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.detailedResponses ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-medical-charcoal">Include References</h3>
                      <p className="text-sm text-neutral-600">Cite Nelson Textbook chapters</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('includeReferences', !preferences.includeReferences)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.includeReferences ? 'bg-primary-500' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.includeReferences ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-medical-charcoal">Clinical Focus</h3>
                      <p className="text-sm text-neutral-600">Prioritize practical clinical application</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('clinicalFocus', !preferences.clinicalFocus)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.clinicalFocus ? 'bg-primary-500' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.clinicalFocus ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Management Section */}
              <div>
                <h2 className="text-lg font-semibold text-medical-charcoal mb-4">Data Management</h2>
                <p className="text-sm text-neutral-600 mb-6">
                  Manage your chat history and exported data
                </p>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
                      clearAllChats();
                    }
                  }}
                  className="w-full p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-red-700 font-medium transition-colors"
                >
                  Clear All Chat History
                </button>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="w-full p-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
