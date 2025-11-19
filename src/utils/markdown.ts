import { Citation } from '@/types';

/**
 * Parse citations from markdown content
 * @param content - Markdown content with citations
 * @returns Array of citations found in the content
 */
export function parseCitations(content: string): Citation[] {
  const citationRegex = /\[Nelson Ch\. (\d+)(?::(\d+-?\d*))?(?:\s*-\s*(.+?))?\]/g;
  const citations: Citation[] = [];
  let match;

  while ((match = citationRegex.exec(content)) !== null) {
    const [, chapter, pageRange, title] = match;
    
    citations.push({
      id: `citation-${chapter}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chapter: `Chapter ${chapter}`,
      pageRange: pageRange || 'N/A',
      title: title || `Nelson Textbook Chapter ${chapter}`,
      excerpt: '', // Will be populated from context if available
      confidence: 'high' // Default confidence, can be adjusted based on context
    });
  }

  return citations;
}

/**
 * Replace citation text with clickable badges
 * @param content - Content with citation markers
 * @param onCitationClick - Callback for citation clicks
 * @returns JSX content with citation badges
 */
export function renderCitationsAsBadges(
  content: string,
  _onCitationClick: (citation: Citation) => void
): string {
  const citationRegex = /\[Nelson Ch\. (\d+)(?::(\d+-?\d*))?(?:\s*-\s*(.+?))?\]/g;
  
  return content.replace(citationRegex, (_, chapter, pageRange, title) => {
    const citation: Citation = {
      id: `citation-${chapter}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chapter: `Chapter ${chapter}`,
      pageRange: pageRange || 'N/A',
      title: title || `Nelson Textbook Chapter ${chapter}`,
      excerpt: '',
      confidence: 'high'
    };

    // Return a placeholder that will be replaced with actual badge component
    return `<citation-badge data-citation='${JSON.stringify(citation)}'>[Nelson Ch. ${chapter}]</citation-badge>`;
  });
}

/**
 * Clean markdown content for display
 * @param content - Raw markdown content
 * @returns Cleaned content
 */
export function cleanMarkdownContent(content: string): string {
  return content
    .trim()
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
    .replace(/\s+$/gm, '') // Remove trailing spaces from lines
    .replace(/^\s+/gm, '') // Remove leading spaces from lines (except code blocks)
    .replace(/\*\*(.*?)\*\*/g, '**$1**') // Ensure bold formatting is consistent
    .replace(/\*(.*?)\*/g, '*$1*'); // Ensure italic formatting is consistent
}

/**
 * Extract headings from markdown content
 * @param content - Markdown content
 * @returns Array of headings with levels
 */
export function extractHeadings(content: string): Array<{ level: number; text: string; id: string }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string; id: string }> = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

    headings.push({ level, text, id });
  }

  return headings;
}

/**
 * Generate table of contents from markdown content
 * @param content - Markdown content
 * @returns Table of contents as markdown
 */
export function generateTableOfContents(content: string): string {
  const headings = extractHeadings(content);
  
  if (headings.length === 0) {
    return '';
  }

  let toc = '## Table of Contents\n\n';
  
  headings.forEach(heading => {
    const indent = '  '.repeat(heading.level - 1);
    toc += `${indent}- [${heading.text}](#${heading.id})\n`;
  });

  return toc + '\n';
}

/**
 * Estimate reading time for content
 * @param content - Text content
 * @param wordsPerMinute - Average reading speed (default: 200 WPM)
 * @returns Estimated reading time in minutes
 */
export function estimateReadingTime(content: string, wordsPerMinute: number = 200): number {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Truncate content to a specific length with ellipsis
 * @param content - Content to truncate
 * @param maxLength - Maximum length in characters
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated content
 */
export function truncateContent(content: string, maxLength: number, suffix: string = '...'): string {
  if (content.length <= maxLength) {
    return content;
  }

  // Try to break at a word boundary
  const truncated = content.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + suffix;
  }
  
  return truncated + suffix;
}

/**
 * Convert markdown to plain text (strip formatting)
 * @param markdown - Markdown content
 * @returns Plain text content
 */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Remove images, keep alt text
    .replace(/\n{2,}/g, '\n') // Replace multiple newlines
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    .trim();
}

/**
 * Highlight search terms in content
 * @param content - Content to highlight
 * @param searchTerms - Terms to highlight
 * @returns Content with highlighted terms
 */
export function highlightSearchTerms(content: string, searchTerms: string[]): string {
  if (!searchTerms || searchTerms.length === 0) {
    return content;
  }

  let highlightedContent = content;
  
  searchTerms.forEach(term => {
    if (term.trim().length > 0) {
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlightedContent = highlightedContent.replace(regex, '<mark>$1</mark>');
    }
  });

  return highlightedContent;
}

/**
 * Validate markdown syntax
 * @param content - Markdown content to validate
 * @returns Object with validation results
 */
export function validateMarkdown(content: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for unclosed bold/italic formatting
  const boldMatches = content.match(/\*\*/g);
  if (boldMatches && boldMatches.length % 2 !== 0) {
    errors.push('Unclosed bold formatting (**) detected');
  }

  const italicMatches = content.match(/(?<!\*)\*(?!\*)/g);
  if (italicMatches && italicMatches.length % 2 !== 0) {
    errors.push('Unclosed italic formatting (*) detected');
  }

  // Check for unclosed code blocks
  const codeBlockMatches = content.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    errors.push('Unclosed code block (```) detected');
  }

  // Check for malformed links
  const malformedLinks = content.match(/\[[^\]]*\]\([^)]*$/g);
  if (malformedLinks) {
    warnings.push('Potentially malformed links detected');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
