import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import SplashScreen from './components/SplashScreen';
import WelcomeScreen from './components/WelcomeScreen';
import ChatInterface from './components/ChatInterface';
import HistoryScreen from './components/HistoryScreen';
import SettingsPanel from './components/SettingsPanel';
import Navigation from './components/Navigation';
import CitationModal from './components/CitationModal';
import InstallPrompt from './components/InstallPrompt';
import OfflineBanner from './components/OfflineBanner';

// Store
import { useChatStore, useCurrentScreen, usePreferences } from './store/chatStore';



function App() {
  const currentScreen = useCurrentScreen();
  const preferences = usePreferences();
  const { 
    showSettings, 
    showCitationModal, 
    selectedCitation, 
    isOnline,
    showInstallPrompt,
    setCurrentScreen,
    hideCitationModal,
    toggleSettings 
  } = useChatStore();

  // Initialize app and handle splash screen timing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentScreen === 'splash') {
        setCurrentScreen('welcome');
      }
    }, 3000); // 3 second splash screen

    return () => clearTimeout(timer);
  }, [currentScreen, setCurrentScreen]);

  // Apply theme preferences
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.fontSize = fontSizeMap[preferences.fontSize];

    // Apply color palette
    const colorPalettes = {
      amber: {
        primary: '#F59E0B',
        primaryLight: '#FEF3C7',
        primaryDark: '#D97706'
      },
      blue: {
        primary: '#3B82F6',
        primaryLight: '#DBEAFE',
        primaryDark: '#1D4ED8'
      },
      orange: {
        primary: '#F97316',
        primaryLight: '#FED7AA',
        primaryDark: '#EA580C'
      },
      gray: {
        primary: '#6B7280',
        primaryLight: '#F3F4F6',
        primaryDark: '#374151'
      }
    };

    const palette = colorPalettes[preferences.colorPalette];
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty('--color-primary-light', palette.primaryLight);
    root.style.setProperty('--color-primary-dark', palette.primaryDark);
  }, [preferences]);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'welcome':
        return <WelcomeScreen />;
      case 'chat':
        return <ChatInterface />;
      case 'history':
        return <HistoryScreen />;
      case 'settings':
        return <SettingsPanel isOpen={true} onClose={() => setCurrentScreen('welcome')} />;
      case 'profile':
        return <div className="flex items-center justify-center h-screen">
          <p className="text-lg text-medical-charcoal">Profile screen coming soon!</p>
        </div>;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-medical-ivory text-medical-charcoal">
      {/* Offline Banner */}
      {!isOnline && <OfflineBanner />}

      {/* Install Prompt */}
      {showInstallPrompt === true && <InstallPrompt />}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="min-h-screen"
        >
          {renderCurrentScreen()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation - Hidden on splash and settings screens */}
      {currentScreen !== 'splash' && currentScreen !== 'settings' && (
        <Navigation />
      )}

      {/* Settings Panel Overlay */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel 
            isOpen={showSettings} 
            onClose={toggleSettings} 
          />
        )}
      </AnimatePresence>

      {/* Citation Modal */}
      <AnimatePresence>
        {showCitationModal && selectedCitation && (
          <CitationModal
            citation={selectedCitation}
            isOpen={showCitationModal}
            onClose={hideCitationModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
