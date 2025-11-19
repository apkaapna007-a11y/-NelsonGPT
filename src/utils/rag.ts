/**
 * RAG (Retrieval-Augmented Generation) Pipeline for Nelson-GPT
 * Orchestrates vector search, context assembly, and LLM generation
 */

import { generateEmbedding } from './embeddings';
import { streamChatCompletion, createSystemPrompt } from './mistral';
import { vectorSearch as supabaseVectorSearch } from './supabase';
import { vectorSearch as mongoVectorSearch, searchDrugDosages, extractCitationsFromResults } from './mongodb';
import { parseCitations } from './markdown';
import { EmbeddingResult, Citation, ChatMode } from '../types';

export interface RAGConfig {
  vectorProvider: 'supabase' | 'mongodb';
  maxContextLength: number;
  similarityThreshold: number;
  maxCitations: number;
  includeReferences: boolean;
  clinicalFocus: boolean;
}

export interface RAGResult {
  response: string;
  citations: Citation[];
  sources: EmbeddingResult[];
  confidence: number;
}

/**
 * Default RAG configuration
 */
const DEFAULT_RAG_CONFIG: RAGConfig = {
  vectorProvider: 'supabase', // Default to Supabase, fallback to MongoDB
  maxContextLength: 4000,
  similarityThreshold: 0.7,
  maxCitations: 10,
  includeReferences: true,
  clinicalFocus: false
};

/**
 * Main RAG pipeline function
 */
export async function* ragPipeline(
  query: string,
  mode: ChatMode = 'academic',
  config: Partial<RAGConfig> = {}
): AsyncGenerator<{ type: 'chunk' | 'citations' | 'complete'; data: any }> {
  const ragConfig = { ...DEFAULT_RAG_CONFIG, ...config };

  try {
    // Step 1: Generate query embedding
    yield { type: 'chunk', data: 'Analyzing your question...' };
    
    const queryEmbedding = await generateEmbedding(query);
    
    // Step 2: Perform vector search
    yield { type: 'chunk', data: 'Searching medical knowledge base...' };
    
    const searchResults = await performVectorSearch(
      queryEmbedding,
      ragConfig,
      mode
    );

    // Step 3: Filter and rank results
    const filteredResults = filterSearchResults(searchResults, ragConfig);
    
    if (filteredResults.length === 0) {
      yield { type: 'chunk', data: "I couldn't find relevant information in the medical knowledge base. Please try rephrasing your question or being more specific." };
      yield { type: 'complete', data: null };
      return;
    }

    // Step 4: Extract citations
    const citations = extractCitations(filteredResults, ragConfig);
    yield { type: 'citations', data: citations };

    // Step 5: Assemble context
    const context = assembleContext(filteredResults, ragConfig);
    
    // Step 6: Generate system prompt
    const systemPrompt = createSystemPrompt(mode, {
      includeReferences: ragConfig.includeReferences,
      clinicalFocus: ragConfig.clinicalFocus
    });

    // Step 7: Stream LLM response
    yield { type: 'chunk', data: 'Generating response...' };
    
    const prompt = `${systemPrompt}

Context from Nelson Textbook of Pediatrics:
${context}

User Question: ${query}

Please provide a comprehensive, evidence-based answer with appropriate citations.`;

    // Stream the response
    for await (const chunk of streamChatCompletion(prompt)) {
      yield { type: 'chunk', data: chunk };
    }

    yield { type: 'complete', data: { citations, sources: filteredResults } };

  } catch (error) {
    console.error('RAG Pipeline error:', error);
    yield { 
      type: 'chunk', 
      data: `I encountered an error while processing your question: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.` 
    };
    yield { type: 'complete', data: null };
  }
}

/**
 * Perform vector search using configured provider
 */
async function performVectorSearch(
  queryEmbedding: number[],
  config: RAGConfig,
  mode: ChatMode
): Promise<EmbeddingResult[]> {
  const searchOptions = {
    limit: config.maxCitations * 2, // Search more to filter later
    medicalSpecialty: mode === 'clinical' ? 'pediatrics' : undefined,
    minConfidenceScore: config.similarityThreshold
  };

  try {
    // Try primary vector provider
    if (config.vectorProvider === 'mongodb') {
      return await mongoVectorSearch(queryEmbedding, searchOptions);
    } else {
      return await supabaseVectorSearch(queryEmbedding, searchOptions);
    }
  } catch (error) {
    console.warn(`Primary vector provider (${config.vectorProvider}) failed, trying fallback:`, error);
    
    // Fallback to alternative provider
    try {
      if (config.vectorProvider === 'mongodb') {
        return await supabaseVectorSearch(queryEmbedding, searchOptions);
      } else {
        return await mongoVectorSearch(queryEmbedding, searchOptions);
      }
    } catch (fallbackError) {
      console.error('Both vector providers failed:', fallbackError);
      throw new Error('Vector search unavailable. Please try again later.');
    }
  }
}

/**
 * Filter and rank search results
 */
function filterSearchResults(
  results: EmbeddingResult[],
  config: RAGConfig
): EmbeddingResult[] {
  return results
    .filter(result => result.similarity >= config.similarityThreshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, config.maxCitations);
}

/**
 * Extract citations from search results
 */
function extractCitations(
  results: EmbeddingResult[],
  config: RAGConfig
): Citation[] {
  if (!config.includeReferences) {
    return [];
  }

  return extractCitationsFromResults(results).slice(0, config.maxCitations);
}

/**
 * Assemble context from search results
 */
function assembleContext(
  results: EmbeddingResult[],
  config: RAGConfig
): string {
  let context = '';
  let currentLength = 0;

  for (const result of results) {
    const resultText = `[Source: Nelson Ch. ${result.source?.chapter || 'Unknown'}]\n${result.content}\n\n`;
    
    if (currentLength + resultText.length > config.maxContextLength) {
      break;
    }
    
    context += resultText;
    currentLength += resultText.length;
  }

  return context.trim();
}

/**
 * Search for drug dosage information
 */
export async function searchDrugInformation(
  drugQuery: string,
  options: {
    ageGroup?: string;
    route?: string;
    limit?: number;
  } = {}
): Promise<any[]> {
  try {
    return await searchDrugDosages(drugQuery, options);
  } catch (error) {
    console.error('Drug search error:', error);
    return [];
  }
}

/**
 * Get RAG configuration based on user preferences
 */
export function getRAGConfig(preferences: {
  detailedResponses?: boolean;
  includeReferences?: boolean;
  clinicalFocus?: boolean;
  vectorProvider?: 'supabase' | 'mongodb';
}): Partial<RAGConfig> {
  return {
    maxContextLength: preferences.detailedResponses ? 6000 : 4000,
    includeReferences: preferences.includeReferences ?? true,
    clinicalFocus: preferences.clinicalFocus ?? false,
    vectorProvider: preferences.vectorProvider ?? 'supabase',
    maxCitations: preferences.detailedResponses ? 15 : 10
  };
}

/**
 * Validate RAG system health
 */
export async function validateRAGSystem(): Promise<{
  isHealthy: boolean;
  issues: string[];
  providers: {
    embeddings: boolean;
    supabase: boolean;
    mongodb: boolean;
    mistral: boolean;
  };
}> {
  const issues: string[] = [];
  const providers = {
    embeddings: false,
    supabase: false,
    mongodb: false,
    mistral: false
  };

  // Test embeddings
  try {
    await generateEmbedding('test');
    providers.embeddings = true;
  } catch (error) {
    issues.push('Embeddings service unavailable');
  }

  // Test Supabase
  try {
    const { healthCheck: supabaseHealth } = await import('./supabase');
    providers.supabase = await supabaseHealth();
  } catch (error) {
    issues.push('Supabase connection failed');
  }

  // Test MongoDB
  try {
    const { healthCheck: mongoHealth } = await import('./mongodb');
    providers.mongodb = await mongoHealth();
  } catch (error) {
    issues.push('MongoDB connection failed');
  }

  // Test Mistral
  try {
    const { healthCheck: mistralHealth } = await import('./mistral');
    providers.mistral = await mistralHealth();
  } catch (error) {
    issues.push('Mistral API unavailable');
  }

  const isHealthy = providers.embeddings && 
                   (providers.supabase || providers.mongodb) && 
                   providers.mistral;

  return { isHealthy, issues, providers };
}
