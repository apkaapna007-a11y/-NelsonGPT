/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MONGODB_DATA_API_URL: string
    readonly VITE_MONGODB_API_KEY: string
    readonly VITE_MONGODB_CLUSTER: string
    readonly VITE_MONGODB_DATABASE: string
    readonly VITE_HF_API_KEY: string
    readonly VITE_HF_EMBEDDING_MODEL: string
    readonly VITE_MISTRAL_API_KEY: string
    readonly VITE_MISTRAL_MODEL: string
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
