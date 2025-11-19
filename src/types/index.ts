// Core types for Nelson-GPT application

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  citations?: Citation[];
  isStreaming?: boolean;
}

export interface Citation {
  id: string;
  chapter: string;
  pageRange: string;
  title: string;
  excerpt: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  mode: 'academic' | 'clinical';
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  responseStyle: 'concise' | 'detailed';
  citationFormat: 'inline' | 'footnotes';
  colorPalette: 'amber' | 'blue' | 'orange' | 'gray';
  detailedResponses: boolean;
  includeReferences: boolean;
  clinicalFocus: boolean;
}

export interface AppState {
  // Chat state
  currentChatId: string | null;
  chats: Chat[];
  isLoading: boolean;
  isStreaming: boolean;
  
  // UI state
  currentScreen: 'splash' | 'welcome' | 'chat' | 'history' | 'settings' | 'profile';
  showSettings: boolean;
  showCitationModal: boolean;
  selectedCitation: Citation | null;
  
  // User state
  user: User | null;
  preferences: UserPreferences;
  
  // App state
  isOnline: boolean;
  installPromptEvent: any;
  showInstallPrompt: boolean;
}

// RAG-related types
export interface EmbeddingResult {
  embedding: number[];
  text: string;
  metadata: {
    chapter: string;
    page: number;
    section: string;
    title: string;
  };
}

export interface VectorSearchResult {
  id: string;
  content: string;
  metadata: {
    chapter: string;
    pageRange: string;
    section: string;
    title: string;
  };
  similarity: number;
}

export interface RAGContext {
  query: string;
  retrievedChunks: VectorSearchResult[];
  assembledContext: string;
  citations: Citation[];
}

// API types
export interface MistralStreamResponse {
  choices: Array<{
    delta: {
      content?: string;
    };
    finish_reason?: string;
  }>;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface MistralConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// Component prop types
export interface MessageBubbleProps {
  message: Message;
  onCitationClick: (citation: Citation) => void;
}

export interface CitationBadgeProps {
  citation: Citation;
  onClick: (citation: Citation) => void;
}

export interface InputDockProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Utility types
export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';
export type ResponseStyle = 'concise' | 'detailed';
export type CitationFormat = 'inline' | 'footnotes';
export type ColorPalette = 'amber' | 'blue' | 'orange' | 'gray';
export type ChatMode = 'academic' | 'clinical';
export type Screen = 'splash' | 'welcome' | 'chat' | 'history' | 'settings' | 'profile';

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export interface NetworkError extends AppError {
  status?: number;
  retryable: boolean;
}

// Common question types for welcome screen
export interface CommonQuestion {
  id: string;
  title: string;
  icon: string;
  query: string;
  category: 'development' | 'respiratory' | 'cardiac' | 'vaccination' | 'general';
}
