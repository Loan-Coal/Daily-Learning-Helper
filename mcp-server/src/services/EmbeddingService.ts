import { HfInference } from '@huggingface/inference';

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
}

export class EmbeddingService {
  private hf: HfInference;
  private model: string;

  constructor() {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      throw new Error('HUGGINGFACE_API_KEY environment variable is required');
    }

    this.hf = new HfInference(apiKey);
    this.model = process.env.EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    try {
      console.log(`Generating embedding for text of length: ${text.length}`);
      
      const result = await this.hf.featureExtraction({
        model: this.model,
        inputs: text
      });

      // Convert the result to a proper number array
      let embedding: number[];
      
      if (Array.isArray(result)) {
        // Handle different response formats
        if (Array.isArray(result[0])) {
          embedding = result[0] as number[];
        } else {
          embedding = result as number[];
        }
      } else {
        throw new Error('Unexpected embedding response format');
      }

      return {
        embedding,
        tokens: Math.ceil(text.length / 4) // Rough token estimation
      };
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    try {
      console.log(`Generating embeddings for ${texts.length} texts`);
      
      const results = await Promise.all(
        texts.map(text => this.generateEmbedding(text))
      );

      return results;
    } catch (error) {
      console.error('Failed to generate batch embeddings:', error);
      throw error;
    }
  }

  async generateQueryEmbedding(query: string): Promise<number[]> {
    const result = await this.generateEmbedding(query);
    return result.embedding;
  }

  getModel(): string {
    return this.model;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.generateEmbedding('health check');
      return true;
    } catch (error) {
      console.error('Embedding service health check failed:', error);
      return false;
    }
  }
}