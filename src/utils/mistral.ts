import { MistralStreamResponse } from '@/types';

// Mistral AI configuration
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const MISTRAL_MODEL = import.meta.env.VITE_MISTRAL_MODEL || 'mistral-large-latest';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

if (!MISTRAL_API_KEY) {
  console.warn('Missing Mistral API key - streaming responses will not work');
}

/**
 * Create a system prompt for Nelson-GPT based on mode and context
 */
export function createSystemPrompt(
  options: { includeReferences: boolean; clinicalFocus: boolean }
): string {
  const basePrompt = `You are Nelson-GPT, a pediatric knowledge assistant based on the Nelson Textbook of Pediatrics. You provide evidence-based answers to healthcare professionals.

IMPORTANT GUIDELINES:
- Provide accurate, evidence-based medical information
- Use clear, professional medical language appropriate for healthcare professionals
- If uncertain about any information, acknowledge limitations
- Never provide specific treatment recommendations without proper context
- Always recommend consulting with experienced colleagues for patient care decisions
`;

  const citationInstruction = options.includeReferences
    ? '- Always cite sources using the format [Nelson Ch. X] where X is the chapter number'
    : '- Do not include citations in your response.';

  const clinicalFocusInstruction = options.clinicalFocus
    ? 'CLINICAL MODE: Focus on practical clinical applications, differential diagnoses, treatment approaches, and bedside management. Prioritize actionable information for immediate clinical use.'
    : 'ACADEMIC MODE: Provide comprehensive explanations with detailed pathophysiology, epidemiology, and theoretical background. Include educational context and learning objectives.';

  return `${basePrompt}\n${citationInstruction}\n\n${clinicalFocusInstruction}`;
}

/**
 * Stream chat completion from Mistral AI
 */
export async function* streamChatCompletion(
  messages: Array<{ role: string; content: string }>,
  onError?: (error: Error) => void
): AsyncGenerator<string, void, unknown> {
  if (!MISTRAL_API_KEY) {
    throw new Error('Mistral API key not configured');
  }

  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages,
        stream: true,
        max_tokens: 2000,
        temperature: 0.3, // Lower temperature for more consistent medical responses
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Mistral API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine === '') continue;
          if (trimmedLine === 'data: [DONE]') return;
          if (!trimmedLine.startsWith('data: ')) continue;

          try {
            const jsonStr = trimmedLine.slice(6); // Remove 'data: ' prefix
            const data: MistralStreamResponse = JSON.parse(jsonStr);
            
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }

            // Check if streaming is finished
            if (data.choices?.[0]?.finish_reason) {
              return;
            }
          } catch (parseError) {
            console.warn('Failed to parse streaming response:', parseError);
            continue;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('Mistral streaming error:', error);
    if (onError) {
      onError(error as Error);
    }
    throw error;
  }
}

/**
 * Non-streaming chat completion (fallback)
 */
export async function getChatCompletion(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  if (!MISTRAL_API_KEY) {
    throw new Error('Mistral API key not configured');
  }

  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages,
        max_tokens: 2000,
        temperature: 0.3,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Mistral API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Mistral API error:', error);
    throw error;
  }
}

/**
 * Extract citations from AI response
 */
export function extractCitations(content: string): Array<{ text: string; chapter: string }> {
  const citationRegex = /\[Nelson Ch\. (\d+)\]/g;
  const citations: Array<{ text: string; chapter: string }> = [];
  let match;

  while ((match = citationRegex.exec(content)) !== null) {
    citations.push({
      text: match[0],
      chapter: match[1]
    });
  }

  return citations;
}

/**
 * Validate API key format
 */
export function validateApiKey(apiKey: string): boolean {
  // Basic validation for Mistral API key format
  return typeof apiKey === 'string' && apiKey.length > 20 && apiKey.startsWith('');
}

/**
 * Get available models (for future use)
 */
export async function getAvailableModels(): Promise<string[]> {
  if (!MISTRAL_API_KEY) {
    throw new Error('Mistral API key not configured');
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data?.map((model: any) => model.id) || [];
  } catch (error) {
    console.error('Error fetching available models:', error);
    throw error;
  }
}

/**
 * Health check for Mistral API
 */
export async function healthCheck(): Promise<boolean> {
  if (!MISTRAL_API_KEY) {
    return false;
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Mistral health check failed:', error);
    return false;
  }
}

