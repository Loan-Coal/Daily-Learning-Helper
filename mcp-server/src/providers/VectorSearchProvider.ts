import { ChromaService } from '../services/ChromaService';
import { EmbeddingService } from '../services/EmbeddingService';

export interface ContextResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  relevanceScore: number;
}

export class VectorSearchProvider {
  private chromaService: ChromaService;
  private embeddingService: EmbeddingService;

  constructor() {
    this.chromaService = ChromaService.getInstance();
    this.embeddingService = new EmbeddingService();
  }

  async getRelevantContexts(
    tags: string[],
    maxContexts: number = 10,
    semanticQuery?: string
  ): Promise<ContextResult[]> {
    try {
      let queryEmbedding: number[];

      if (semanticQuery) {
        // Use semantic query for embedding
        queryEmbedding = await this.embeddingService.generateQueryEmbedding(semanticQuery);
      } else {
        // Use tags to create a query
        const tagQuery = `Topics: ${tags.join(', ')}. Educational content about ${tags.join(' and ')}.`;
        queryEmbedding = await this.embeddingService.generateQueryEmbedding(tagQuery);
      }

      // Search in Chroma with tag filtering
      const searchResults = await this.chromaService.searchSimilar(
        queryEmbedding,
        maxContexts,
        tags
      );

      // Convert to ContextResult format
      return searchResults.map(result => ({
        id: result.id,
        content: result.content,
        metadata: result.metadata,
        relevanceScore: 1 - result.distance // Convert distance to relevance score
      }));

    } catch (error) {
      console.error('Failed to get relevant contexts:', error);
      throw error;
    }
  }

  async searchByText(
    query: string,
    maxResults: number = 10,
    tagFilter?: string[]
  ): Promise<ContextResult[]> {
    try {
      const queryEmbedding = await this.embeddingService.generateQueryEmbedding(query);
      
      const searchResults = await this.chromaService.searchSimilar(
        queryEmbedding,
        maxResults,
        tagFilter
      );

      return searchResults.map(result => ({
        id: result.id,
        content: result.content,
        metadata: result.metadata,
        relevanceScore: 1 - result.distance
      }));

    } catch (error) {
      console.error('Failed to search by text:', error);
      throw error;
    }
  }

  async getContextsByIds(ids: string[]): Promise<ContextResult[]> {
    // This would need to be implemented in ChromaService
    // For now, return empty array
    console.warn('getContextsByIds not yet implemented');
    return [];
  }

  async healthCheck(): Promise<boolean> {
    try {
      const chromaHealthy = await this.chromaService.healthCheck();
      const embeddingHealthy = await this.embeddingService.healthCheck();
      return chromaHealthy && embeddingHealthy;
    } catch (error) {
      console.error('Vector search provider health check failed:', error);
      return false;
    }
  }
}