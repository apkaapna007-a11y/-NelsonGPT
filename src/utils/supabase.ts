import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { VectorSearchResult } from '@/types';

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Perform vector similarity search using pgvector
 * @param queryEmbedding - The embedding vector for the query
 * @param limit - Maximum number of results to return
 * @param threshold - Minimum similarity threshold (0-1)
 * @returns Array of similar document chunks with metadata
 */
export async function vectorSearch(
  queryEmbedding: number[],
  limit: number = 10,
  threshold: number = 0.7
): Promise<VectorSearchResult[]> {
  try {
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit
    });

    if (error) {
      console.error('Vector search error:', error);
      throw new Error(`Vector search failed: ${error.message}`);
    }

    return data.map((item: any) => ({
      id: item.id,
      content: item.content,
      metadata: {
        chapter: item.metadata.chapter,
        pageRange: item.metadata.page_range,
        section: item.metadata.section,
        title: item.metadata.title
      },
      similarity: item.similarity
    }));
  } catch (error) {
    console.error('Error performing vector search:', error);
    throw error;
  }
}

/**
 * Store a new document embedding in the database
 * @param content - The text content
 * @param embedding - The embedding vector
 * @param metadata - Document metadata
 */
export async function storeEmbedding(
  content: string,
  embedding: number[],
  metadata: {
    chapter: string;
    page: number;
    section: string;
    title: string;
  }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('documents')
      .insert({
        content,
        embedding,
        metadata
      });

    if (error) {
      console.error('Error storing embedding:', error);
      throw new Error(`Failed to store embedding: ${error.message}`);
    }
  } catch (error) {
    console.error('Error storing embedding:', error);
    throw error;
  }
}

/**
 * Get document by ID
 * @param id - Document ID
 */
export async function getDocument(id: string) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      throw new Error(`Failed to fetch document: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}

/**
 * Store user chat history
 * @param userId - User ID
 * @param chatData - Chat data to store
 */
export async function storeChatHistory(userId: string, chatData: any) {
  try {
    const { error } = await supabase
      .from('chat_history')
      .insert({
        user_id: userId,
        chat_data: chatData,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing chat history:', error);
      throw new Error(`Failed to store chat history: ${error.message}`);
    }
  } catch (error) {
    console.error('Error storing chat history:', error);
    throw error;
  }
}

/**
 * Retrieve user chat history
 * @param userId - User ID
 * @param limit - Maximum number of chats to retrieve
 */
export async function getChatHistory(userId: string, limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching chat history:', error);
      throw new Error(`Failed to fetch chat history: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
}

/**
 * Health check for Supabase connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documents')
      .select('count')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Supabase health check failed:', error);
    return false;
  }
}

/**
 * Initialize database schema (for development)
 * This would typically be done via Supabase migrations
 */
export async function initializeSchema() {
  // This is a placeholder - actual schema should be created via Supabase migrations
  console.log('Schema initialization should be done via Supabase migrations');
  
  // Example SQL for reference:
  /*
  -- Enable pgvector extension
  CREATE EXTENSION IF NOT EXISTS vector;
  
  -- Create documents table
  CREATE TABLE documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    embedding VECTOR(384), -- Adjust dimension based on your embedding model
    metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Create index for vector similarity search
  CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
  
  -- Create function for similarity search
  CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(384),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
  )
  RETURNS TABLE(
    id UUID,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
  )
  LANGUAGE SQL STABLE
  AS $$
    SELECT
      documents.id,
      documents.content,
      documents.metadata,
      1 - (documents.embedding <=> query_embedding) AS similarity
    FROM documents
    WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
    ORDER BY documents.embedding <=> query_embedding
    LIMIT match_count;
  $$;
  
  -- Create chat history table
  CREATE TABLE chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    chat_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Create index on user_id and created_at
  CREATE INDEX idx_chat_history_user_created ON chat_history(user_id, created_at DESC);
  */
}
