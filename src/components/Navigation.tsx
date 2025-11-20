import React from 'react';
import { motion } from 'framer-motion';
import { useChatStore, useCurrentScreen } from '../store/chatStore';
import { Screen } from '../types';

interface NavItem {
  id: Screen;
  label: string;
  icon: React.ReactNode;
}

const Navigation: React.FC = () => {
  const currentScreen = useCurrentScreen();
  const { setCurrentScreen } = useChatStore();

  const navItems: NavItem[] = [
    {
      id: 'chat',
      label: 'Chat',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path 
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      )
    },
    {
      id: 'history',
      label: 'History',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  const handleNavClick = (screen: Screen) => {
    if (screen === 'chat') {
      // If no current chat, go to welcome screen
      const { currentChatId } = useChatStore.getState();
      if (!currentChatId) {
        setCurrentScreen('welcome');
        return;
      }
    }
    setCurrentScreen(screen);
  };

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      role="navigation"
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 safe-area-bottom z-50"
    >
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id || 
            (item.id === 'chat' && currentScreen === 'welcome');
          
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavClick(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-100 text-primary-600'
                  : 'text-neutral-500 hover:text-primary-500 hover:bg-primary-50'
              }`}
            >
              {/* Icon */}
              <div className={`mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              
              {/* Label */}
              <span className={`text-xs font-medium transition-all duration-200 ${
                isActive ? 'text-primary-600' : 'text-neutral-500'
              }`}>
                {item.label}
              </span>
              
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary-500 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default Navigation;

