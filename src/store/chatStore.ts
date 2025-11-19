import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  AppState, 
  Chat, 
  Message, 
  UserPreferences, 
  Citation, 
  Screen,
  ChatMode,
  CommonQuestion 
} from '@/types';

// Default user preferences
const defaultPreferences: UserPreferences = {
  theme: 'light',
  fontSize: 'medium',
  responseStyle: 'detailed',
  citationFormat: 'inline',
  colorPalette: 'amber',
  detailedResponses: true,
  includeReferences: true,
  clinicalFocus: false,
};

// Common questions for welcome screen
const commonQuestions: CommonQuestion[] = [
  {
    id: 'developmental-milestones',
    title: 'Developmental Milestones',
    icon: '👶',
    query: 'What are the key developmental milestones for a 2-year-old child?',
    category: 'development'
  },
  {
    id: 'respiratory-assessment',
    title: 'Respiratory Assessment',
    icon: '🫁',
    query: 'How do I assess respiratory distress in a pediatric patient?',
    category: 'respiratory'
  },
  {
    id: 'cardiac-conditions',
    title: 'Cardiac Conditions',
    icon: '❤️',
    query: 'What are the most common congenital heart defects in newborns?',
    category: 'cardiac'
  },
  {
    id: 'vaccination-schedule',
    title: 'Vaccination Schedule',
    icon: '💉',
    query: 'What is the recommended vaccination schedule for infants?',
    category: 'vaccination'
  }
];

interface ChatStore extends AppState {
  // Actions
  setCurrentScreen: (screen: Screen) => void;
  setCurrentChatId: (chatId: string | null) => void;
  
  // Chat actions
  createNewChat: (mode: ChatMode) => string;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  deleteChat: (chatId: string) => void;
  clearAllChats: () => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  toggleSettings: () => void;
  showCitationModalAction: (citation: Citation) => void;
  hideCitationModal: () => void;
  
  // Preferences actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  
  // App state actions
  setOnlineStatus: (isOnline: boolean) => void;
  setInstallPrompt: (event: any) => void;
  showInstallPromptAction: () => void;
  hideInstallPrompt: () => void;
  
  // Utility actions
  getChatById: (chatId: string) => Chat | undefined;
  getCurrentChat: () => Chat | undefined;
  getCommonQuestions: () => CommonQuestion[];
  searchChats: (query: string) => Chat[];
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentChatId: null,
      chats: [],
      isLoading: false,
      isStreaming: false,
      currentScreen: 'splash',
      showSettings: false,
      showCitationModal: false,
      selectedCitation: null,
      user: null,
      preferences: defaultPreferences,
      isOnline: navigator.onLine,
      installPromptEvent: null,
      showInstallPrompt: false,

      // Screen navigation
      setCurrentScreen: (screen: Screen) => {
        set({ currentScreen: screen });
      },

      setCurrentChatId: (chatId: string | null) => {
        set({ currentChatId: chatId });
      },

      // Chat management
      createNewChat: (mode: ChatMode = 'academic') => {
        const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newChat: Chat = {
          id: chatId,
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          mode,
        };

        set(state => ({
          chats: [newChat, ...state.chats],
          currentChatId: chatId,
          currentScreen: 'chat'
        }));

        return chatId;
      },

      addMessage: (chatId: string, messageData: Omit<Message, 'id' | 'timestamp'>) => {
        const message: Message = {
          ...messageData,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };

        set(state => ({
          chats: state.chats.map(chat => {
            if (chat.id === chatId) {
              const updatedChat = {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: new Date(),
              };

              // Auto-generate title from first user message
              if (chat.title === 'New Chat' && message.role === 'user') {
                updatedChat.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
              }

              return updatedChat;
            }
            return chat;
          })
        }));
      },

      updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => {
        set(state => ({
          chats: state.chats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.map(msg => 
                  msg.id === messageId ? { ...msg, ...updates } : msg
                ),
                updatedAt: new Date(),
              };
            }
            return chat;
          })
        }));
      },

      deleteChat: (chatId: string) => {
        set(state => {
          const newChats = state.chats.filter(chat => chat.id !== chatId);
          const newCurrentChatId = state.currentChatId === chatId ? null : state.currentChatId;
          
          return {
            chats: newChats,
            currentChatId: newCurrentChatId,
            currentScreen: newCurrentChatId ? 'chat' : 'welcome'
          };
        });
      },

      clearAllChats: () => {
        set({
          chats: [],
          currentChatId: null,
          currentScreen: 'welcome'
        });
      },

      // UI state management
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setStreaming: (streaming: boolean) => {
        set({ isStreaming: streaming });
      },

      toggleSettings: () => {
        set(state => ({ showSettings: !state.showSettings }));
      },

      showCitationModalAction: (citation: Citation) => {
        set({ 
          showCitationModal: true, 
          selectedCitation: citation 
        });
      },

      hideCitationModal: () => {
        set({ 
          showCitationModal: false, 
          selectedCitation: null 
        });
      },

      // Preferences management
      updatePreferences: (newPreferences: Partial<UserPreferences>) => {
        set(state => ({
          preferences: { ...state.preferences, ...newPreferences }
        }));
      },

      // App state management
      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
      },

      setInstallPrompt: (event: any) => {
        set({ 
          installPromptEvent: event,
          showInstallPrompt: true 
        });
      },

      showInstallPromptAction: () => {
        set({ showInstallPrompt: true });
      },

      hideInstallPrompt: () => {
        set({ showInstallPrompt: false });
      },

      // Utility functions
      getChatById: (chatId: string) => {
        return get().chats.find(chat => chat.id === chatId);
      },

      getCurrentChat: () => {
        const { currentChatId, chats } = get();
        if (!currentChatId) return undefined;
        return chats.find(chat => chat.id === currentChatId);
      },

      getCommonQuestions: () => {
        return commonQuestions;
      },

      searchChats: (query: string) => {
        const { chats } = get();
        if (!query.trim()) return chats;

        const searchTerm = query.toLowerCase();
        return chats.filter(chat => 
          chat.title.toLowerCase().includes(searchTerm) ||
          chat.messages.some(msg => 
            msg.content.toLowerCase().includes(searchTerm)
          )
        );
      },
    }),
    {
      name: 'nelson-gpt-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist certain parts of the state
        chats: state.chats,
        preferences: state.preferences,
        currentChatId: state.currentChatId,
      }),
    }
  )
);

// Selectors for better performance
export const useCurrentChat = () => useChatStore(state => state.getCurrentChat());
export const useChats = () => useChatStore(state => state.chats);
export const usePreferences = () => useChatStore(state => state.preferences);
export const useIsLoading = () => useChatStore(state => state.isLoading);
export const useIsStreaming = () => useChatStore(state => state.isStreaming);
export const useCurrentScreen = () => useChatStore(state => state.currentScreen);
export const useCommonQuestions = () => useChatStore(state => state.getCommonQuestions());

// Initialize online status listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useChatStore.getState().setOnlineStatus(true);
  });

  window.addEventListener('offline', () => {
    useChatStore.getState().setOnlineStatus(false);
  });

  // PWA install prompt listener
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    useChatStore.getState().setInstallPrompt(e);
  });
}
