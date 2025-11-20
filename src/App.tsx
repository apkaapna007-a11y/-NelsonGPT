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
    showCitationModal, 
    selectedCitation, 
    isOnline,
    showInstallPrompt,
    setCurrentScreen,
    hideCitationModal
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

  // Apply theme and appearance preferences
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const useDark = preferences.theme === 'dark' || (preferences.theme === 'system' && prefersDark);
      root.classList.toggle('dark', useDark);
    };

    applyTheme();

    let mql: MediaQueryList | null = null;
    let handler: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null;
    if (preferences.theme === 'system' && window.matchMedia) {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
      handler = () => applyTheme();
      mql.addEventListener ? mql.addEventListener('change', handler) : mql.addListener(handler as any);
    }

    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    } as const;
    root.style.fontSize = fontSizeMap[preferences.fontSize];

    const colorPalettes = {
      amber: { primary: '#F59E0B', primaryLight: '#FEF3C7', primaryDark: '#D97706' },
      blue: { primary: '#3B82F6', primaryLight: '#DBEAFE', primaryDark: '#1D4ED8' },
      orange: { primary: '#F97316', primaryLight: '#FED7AA', primaryDark: '#EA580C' },
      gray: { primary: '#6B7280', primaryLight: '#F3F4F6', primaryDark: '#374151' }
    } as const;

    const palette = colorPalettes[preferences.colorPalette];
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty('--color-primary-light', palette.primaryLight);
    root.style.setProperty('--color-primary-dark', palette.primaryDark);

    return () => {
      if (mql && handler) {
        mql.removeEventListener ? mql.removeEventListener('change', handler) : (mql as any).removeListener(handler as any);
      }
    };
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
