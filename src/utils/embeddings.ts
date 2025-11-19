// Hugging Face embeddings utility

const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
const HF_EMBEDDING_MODEL = import.meta.env.VITE_HF_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';
const HF_API_URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_EMBEDDING_MODEL}`;

if (!HF_API_KEY) {
  console.warn('Missing Hugging Face API key - embeddings will not work');
}

/**
 * Generate embeddings using Hugging Face API
 * @param text - Text to generate embeddings for
 * @returns Promise<number[]> - Embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!HF_API_KEY) {
    throw new Error('Hugging Face API key not configured');
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text.trim(),
        options: {
          wait_for_model: true,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Hugging Face API error: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const embedding = await response.json();
    
    // Handle different response formats
    if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
      return embedding[0]; // Nested array format
    } else if (Array.isArray(embedding)) {
      return embedding; // Direct array format
    } else {
      throw new Error('Unexpected embedding response format');
    }
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param texts - Array of texts to generate embeddings for
 * @returns Promise<number[][]> - Array of embedding vectors
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  if (!HF_API_KEY) {
    throw new Error('Hugging Face API key not configured');
  }

  if (!texts || texts.length === 0) {
    throw new Error('Texts array cannot be empty');
  }

  // Filter out empty texts
  const validTexts = texts.filter(text => text && text.trim().length > 0);
  
  if (validTexts.length === 0) {
    throw new Error('No valid texts provided');
  }

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: validTexts,
        options: {
          wait_for_model: true,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Hugging Face API error: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const embeddings = await response.json();
    
    if (Array.isArray(embeddings) && embeddings.every(emb => Array.isArray(emb))) {
      return embeddings;
    } else {
      throw new Error('Unexpected batch embedding response format');
    }
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns number - Cosine similarity (-1 to 1)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Normalize text for better embedding quality
 * @param text - Text to normalize
 * @returns string - Normalized text
 */
export function normalizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s.,!?;:()\-]/g, '') // Remove special characters except basic punctuation
    .toLowerCase();
}

/**
 * Chunk text into smaller pieces for embedding
 * @param text - Text to chunk
 * @param maxLength - Maximum length per chunk (in characters)
 * @param overlap - Overlap between chunks (in characters)
 * @returns string[] - Array of text chunks
 */
export function chunkText(text: string, maxLength: number = 500, overlap: number = 50): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxLength;
    
    // If we're not at the end, try to break at a sentence or word boundary
    if (end < text.length) {
      const sentenceEnd = text.lastIndexOf('.', end);
      const wordEnd = text.lastIndexOf(' ', end);
      
      if (sentenceEnd > start + maxLength * 0.5) {
        end = sentenceEnd + 1;
      } else if (wordEnd > start + maxLength * 0.5) {
        end = wordEnd;
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = Math.max(start + maxLength - overlap, end);
  }

  return chunks.filter(chunk => chunk.length > 0);
}

/**
 * Health check for Hugging Face API
 */
export async function healthCheck(): Promise<boolean> {
  if (!HF_API_KEY) {
    return false;
  }

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: 'test',
        options: {
          wait_for_model: true,
        },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Hugging Face health check failed:', error);
    return false;
  }
}

/**
 * Get model information
 */
export async function getModelInfo(): Promise<any> {
  if (!HF_API_KEY) {
    throw new Error('Hugging Face API key not configured');
  }

  try {
    const response = await fetch(`https://huggingface.co/api/models/${HF_EMBEDDING_MODEL}`, {
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch model info: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching model info:', error);
    throw error;
  }
}

