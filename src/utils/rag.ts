/**
 * RAG (Retrieval-Augmented Generation) Pipeline for Nelson-GPT
 * Orchestrates vector search, context assembly, and LLM generation
 */

import { generateEmbedding } from './embeddings';
import { streamChatCompletion, createSystemPrompt } from './mistral';
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
    const systemPrompt = createSystemPrompt({
      includeReferences: ragConfig.includeReferences,
      clinicalFocus: ragConfig.clinicalFocus,
    });

    // Step 7: Stream LLM response
    yield { type: 'chunk', data: 'Generating response...' };
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context from Nelson Textbook of Pediatrics:\n${context}\n\nUser Question: ${query}\n\nPlease provide a comprehensive, evidence-based answer with appropriate citations.` }
    ];

    // Stream the response
    for await (const chunk of streamChatCompletion(messages)) {
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
function toEmbeddingResult(searchResult: any): EmbeddingResult {
  // MongoDB result shape
  if (typeof searchResult.page_number !== 'undefined' || searchResult.source) {
    return {
      embedding: [],
      text: searchResult.content,
      metadata: {
        chapter: searchResult.chapter || searchResult.metadata?.chapter || 'Unknown',
        page: searchResult.page_number || searchResult.metadata?.page || 0,
        section: searchResult.section || searchResult.metadata?.section || 'Unknown',
        title: searchResult.metadata?.title || ''
      },
      // @ts-ignore - carry similarity for ranking
      similarity: searchResult.similarity || searchResult.score || 0,
      // @ts-ignore
      content: searchResult.content,
      // @ts-ignore
      source: searchResult.source || {
        chapter: searchResult.chapter,
        page: searchResult.page_number,
        section: searchResult.section
      }
    } as any;
  }

  // Supabase result shape
  return {
    embedding: [],
    text: searchResult.content,
    metadata: {
      chapter: searchResult.metadata?.chapter || 'Unknown',
      page: parseInt((searchResult.metadata?.pageRange || '0').toString().split('-')[0] || '0', 10) || 0,
      section: searchResult.metadata?.section || 'Unknown',
      title: searchResult.metadata?.title || ''
    },
    // @ts-ignore
    similarity: searchResult.similarity || 0,
    // @ts-ignore
    content: searchResult.content,
    // @ts-ignore
    source: {
      chapter: searchResult.metadata?.chapter,
      page: parseInt((searchResult.metadata?.pageRange || '0').toString().split('-')[0] || '0', 10) || 0,
      section: searchResult.metadata?.section
    }
  } as any;
}
async function performVectorSearch(
  queryEmbedding: number[],
  config: RAGConfig,
  mode: ChatMode
): Promise<EmbeddingResult[]> {
  const limit = config.maxCitations * 2;
  const threshold = config.similarityThreshold;

  try {
    if (config.vectorProvider === 'mongodb') {
      const { vectorSearch: mongoVectorSearch } = await import('./mongodb');
      const mongoResults = await mongoVectorSearch(queryEmbedding, {
        limit,
        medicalSpecialty: mode === 'clinical' ? 'pediatrics' : undefined,
        minConfidenceScore: threshold
      });
      return mongoResults.map(toEmbeddingResult);
    } else {
      const { vectorSearch: supabaseVectorSearch } = await import('./supabase');
      const supabaseResults = await supabaseVectorSearch(queryEmbedding, limit, threshold);
      return supabaseResults.map(toEmbeddingResult);
    }
  } catch (error) {
    console.warn(`Primary vector provider (${config.vectorProvider}) failed, trying fallback:`, error);
    try {
      if (config.vectorProvider === 'mongodb') {
        const { vectorSearch: supabaseVectorSearch } = await import('./supabase');
        const supabaseResults = await supabaseVectorSearch(queryEmbedding, limit, threshold);
        return supabaseResults.map(toEmbeddingResult);
      } else {
        const { vectorSearch: mongoVectorSearch } = await import('./mongodb');
        const mongoResults = await mongoVectorSearch(queryEmbedding, {
          limit,
          medicalSpecialty: mode === 'clinical' ? 'pediatrics' : undefined,
          minConfidenceScore: threshold
        });
        return mongoResults.map(toEmbeddingResult);
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
    .filter(result => (result as any).similarity >= config.similarityThreshold)
    .sort((a, b) => (b as any).similarity - (a as any).similarity)
    .slice(0, config.maxCitations);
}

/**
 * Extract citations from search results
 */
function extractCitations(
  results: EmbeddingResult[],
  config: RAGConfig
): Citation[] {
  if (!config.includeReferences) return [];

  return results.slice(0, config.maxCitations).map((r, idx) => {
    const chapter = (r as any).metadata?.chapter || (r as any).source?.chapter || 'Unknown';
    const page = (r as any).metadata?.page || (r as any).source?.page || 0;
    const title = (r as any).metadata?.title || 'Unknown';
    const similarity = (r as any).similarity ?? 0;

    return {
      id: `citation-${idx}`,
      chapter: typeof chapter === 'string' && chapter.startsWith('Chapter') ? chapter : `Chapter ${chapter}`,
      pageRange: page ? String(page) : 'N/A',
      title,
      excerpt: (r as any).content ? String((r as any).content).slice(0, 200) + '...' : '',
      confidence: similarity > 0.9 ? 'high' : similarity > 0.8 ? 'medium' : 'low'
    } as Citation;
  });
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
    const meta = (result as any).metadata || {};
    const content = (result as any).content || result.text;
    const chapter = meta.chapter || (result as any).source?.chapter || 'Unknown';
    const resultText = `[Source: Nelson Ch. ${chapter}]\n${content}\n\n`;

    if (currentLength + resultText.length > config.maxContextLength) break;

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
    const { searchDrugDosages } = await import('./mongodb');
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
