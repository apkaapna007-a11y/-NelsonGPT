/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_MISTRAL_API_KEY: string
  readonly VITE_MISTRAL_MODEL: string
  readonly VITE_HF_API_KEY: string
  readonly VITE_HF_EMBEDDING_MODEL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_DEV_MODE: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_PWA_ENABLED: string
  readonly VITE_PWA_CACHE_NAME: string
  readonly VITE_ANALYTICS_ID: string
  readonly VITE_ENABLE_OFFLINE_MODE: string
  readonly VITE_ENABLE_VOICE_INPUT: string
  readonly VITE_ENABLE_EXPORT_CHAT: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_FEEDBACK_ENDPOINT: string
  readonly VITE_MAX_REQUESTS_PER_MINUTE: string
  readonly VITE_MAX_MESSAGE_LENGTH: string
  readonly VITE_MAX_CITATIONS_PER_RESPONSE: string
  readonly VITE_CITATION_CONFIDENCE_THRESHOLD: string
  readonly VITE_VECTOR_SEARCH_LIMIT: string
  readonly VITE_SIMILARITY_THRESHOLD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

