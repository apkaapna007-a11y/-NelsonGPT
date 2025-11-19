/**
 * MongoDB Atlas Vector Search Integration for Nelson-GPT
 * Provides vector similarity search for medical embeddings
 */

// MongoDB Atlas Data API configuration
const MONGODB_DATA_API_URL = import.meta.env.VITE_MONGODB_DATA_API_URL;
const MONGODB_API_KEY = import.meta.env.VITE_MONGODB_API_KEY;
const MONGODB_CLUSTER = import.meta.env.VITE_MONGODB_CLUSTER || 'peadknowledgebase';
const MONGODB_DATABASE = import.meta.env.VITE_MONGODB_DATABASE || 'supabase_migration';

export interface MongoDBSearchResult {
  _id: string;
  score: number;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
  source: any;
  chapter: string;
  page_number: number;
  section: string;
}

export interface Citation {
  id: string;
  source: string;
  page: number;
  section: string;
  confidence: 'high' | 'medium' | 'low';
  excerpt: string;
  chapter: string;
  pageRange: string;
  title: string;
}

/**
 * Perform vector similarity search using MongoDB Atlas Vector Search
 */
export async function vectorSearch(
  queryVector: number[],
  options: {
    collection?: string;
    index?: string;
    limit?: number;
    medicalSpecialty?: string;
    minConfidenceScore?: number;
    ageGroups?: string[];
  } = {}
): Promise<MongoDBSearchResult[]> {
  const {
    collection = 'medical_embeddings',
    index = 'vector_index_medical',
    limit = 10,
    medicalSpecialty,
    minConfidenceScore,
    ageGroups
  } = options;

  try {
    // Build filters
    const filters: Record<string, any> = {};
    
    if (medicalSpecialty) {
      filters.medical_specialty = medicalSpecialty;
    }
    
    if (minConfidenceScore) {
      filters.confidence_score = { $gte: minConfidenceScore };
    }
    
    if (ageGroups && ageGroups.length > 0) {
      filters.age_groups = { $in: ageGroups };
    }

    // MongoDB Atlas Vector Search aggregation pipeline
    const pipeline = [
      {
        $vectorSearch: {
          index: index,
          path: collection === 'godzilla_medical_dataset' ? 'text_embedding' : 'embedding_vector',
          queryVector: queryVector,
          numCandidates: limit * 10, // Search more candidates for better results
          limit: limit,
          ...(Object.keys(filters).length > 0 && { filter: filters })
        }
      },
      {
        $addFields: {
          score: { $meta: 'vectorSearchScore' }
        }
      },
      {
        $project: {
          _id: 1,
          content: 1,
          metadata: 1,
          medical_specialty: 1,
          confidence_score: 1,
          age_groups: 1,
          chapter: 1,
          page_number: 1,
          section: 1,
          score: 1
        }
      }
    ];

    const response = await fetch(`${MONGODB_DATA_API_URL}/action/aggregate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MONGODB_API_KEY,
      },
      body: JSON.stringify({
        collection: collection,
        database: MONGODB_DATABASE,
        dataSource: MONGODB_CLUSTER,
        pipeline: pipeline
      })
    });

    if (!response.ok) {
      throw new Error(`MongoDB Vector Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.documents) {
      throw new Error('No documents returned from MongoDB Vector Search');
    }

    // Transform MongoDB results to MongoDBSearchResult format
    return data.documents.map((doc: any): MongoDBSearchResult => ({
      _id: doc._id,
      score: doc.score || 0,
      content: doc.content || '',
      metadata: doc.metadata || {},
      similarity: doc.score || 0,
      source: {
        chapter: doc.chapter || 'Unknown',
        page: doc.page_number || 0,
        section: doc.section || 'Unknown',
      },
      chapter: doc.chapter || 'Unknown',
      page_number: doc.page_number || 0,
      section: doc.section || 'Unknown',
    }));

  } catch (error) {
    console.error('MongoDB Vector Search error:', error);
    throw new Error(`Vector search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search for drug dosage information using text search
 */
export async function searchDrugDosages(
  query: string,
  options: {
    ageGroup?: string;
    route?: string;
    limit?: number;
  } = {}
): Promise<any[]> {
  const { ageGroup, route, limit = 10 } = options;

  try {
    // Build search query
    const searchQuery: any = {
      text: {
        query: query,
        path: ['drug_name', 'generic_name', 'indication']
      }
    };

    // Add filters
    const filters: any[] = [];
    if (ageGroup) {
      filters.push({ text: { query: ageGroup, path: 'age_group' } });
    }
    if (route) {
      filters.push({ text: { query: route, path: 'route' } });
    }

    if (filters.length > 0) {
      searchQuery.compound = {
        must: [searchQuery],
        filter: filters
      };
      delete searchQuery.text;
    }

    const pipeline = [
      {
        $search: {
          index: 'drug_search_index',
          ...searchQuery
        }
      },
      {
        $limit: limit
      },
      {
        $addFields: {
          score: { $meta: 'searchScore' }
        }
      }
    ];

    const response = await fetch(`${MONGODB_DATA_API_URL}/action/aggregate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MONGODB_API_KEY,
      },
      body: JSON.stringify({
        collection: 'pediatric_drug_dosages',
        database: MONGODB_DATABASE,
        dataSource: MONGODB_CLUSTER,
        pipeline: pipeline
      })
    });

    if (!response.ok) {
      throw new Error(`MongoDB Drug Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.documents || [];

  } catch (error) {
    console.error('MongoDB Drug Search error:', error);
    throw new Error(`Drug search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get medical document by ID
 */
export async function getMedicalDocument(
  documentId: string,
  collection: string = 'medical_embeddings'
): Promise<any | null> {
  try {
    const response = await fetch(`${MONGODB_DATA_API_URL}/action/findOne`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MONGODB_API_KEY,
      },
      body: JSON.stringify({
        collection: collection,
        database: MONGODB_DATABASE,
        dataSource: MONGODB_CLUSTER,
        filter: { _id: { $oid: documentId } }
      })
    });

    if (!response.ok) {
      throw new Error(`MongoDB Document fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.document;

  } catch (error) {
    console.error('MongoDB Document fetch error:', error);
    return null;
  }
}

/**
 * Health check for MongoDB Atlas connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${MONGODB_DATA_API_URL}/action/findOne`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MONGODB_API_KEY,
      },
      body: JSON.stringify({
        collection: 'medical_embeddings',
        database: MONGODB_DATABASE,
        dataSource: MONGODB_CLUSTER,
        filter: {},
        projection: { _id: 1 }
      })
    });

    return response.ok;
  } catch (error) {
    console.error('MongoDB health check failed:', error);
    return false;
  }
}

/**
 * Extract citations from MongoDB search results
 */
export function extractCitationsFromResults(results: MongoDBSearchResult[]): Citation[] {
  return results.map((result, index) => ({
    id: `citation-${index}`,
    source: `Nelson Ch. ${result.chapter || 'Unknown'}`,
    page: result.page_number || 0,
    section: result.section || 'Unknown',
    confidence: result.similarity > 0.9 ? 'high' : result.similarity > 0.8 ? 'medium' : 'low',
    excerpt: result.content ? result.content.substring(0, 200) + '...' : '',
    chapter: result.chapter || 'Unknown',
    pageRange: result.page_number ? `${result.page_number}` : 'N/A',
    title: result.metadata?.title as string || 'Unknown',
  }));
}

/**
 * Validate MongoDB configuration
 */
export function validateMongoDBConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!MONGODB_DATA_API_URL) {
    errors.push('VITE_MONGODB_DATA_API_URL is not configured');
  }

  if (!MONGODB_API_KEY) {
    errors.push('VITE_MONGODB_API_KEY is not configured');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
