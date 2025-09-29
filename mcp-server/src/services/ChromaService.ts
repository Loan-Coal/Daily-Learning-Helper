import path from 'path';
import fs from 'fs';

// Custom error for ChromaDB connection issues
export class ChromaConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChromaConnectionError';
  }
}

export interface ChromaDocument {
  id: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, any>;
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  distance: number;
}

export class ChromaService {
  private static instance: ChromaService;
  private client: any;
  private collection: any = null;
  private initialized = false;

  private constructor() {
    const persistDir = process.env.CHROMA_PERSIST_DIRECTORY || './chroma_data';
    
    // Ensure the persist directory exists
    if (!fs.existsSync(persistDir)) {
      fs.mkdirSync(persistDir, { recursive: true });
    }

    // Use dynamic require to avoid TypeScript issues
    const { ChromaClient } = require('chromadb');
    
    try {
      console.log('Initializing ChromaClient...');
      
      // ChromaClient in newer versions defaults to embedded mode
      // Don't pass path parameter as it's expecting a server URL
      this.client = new ChromaClient();
      
      console.log('ChromaClient initialized successfully');
    } catch (error) {
      console.error('ChromaClient constructor error:', error);
      // Try alternative construction
      const chromadb = require('chromadb');
      console.log('Available chromadb exports:', Object.keys(chromadb));
      
      throw new Error('Unable to initialize ChromaDB client');
    }
  }

  static getInstance(): ChromaService {
    if (!ChromaService.instance) {
      ChromaService.instance = new ChromaService();
    }
    return ChromaService.instance;
  }

  async initialize(): Promise<void> {
    try {
      if (this.initialized) return;

      const collectionName = process.env.CHROMA_COLLECTION_NAME || 'danta_documents';
      
      try {
        // Test if client can communicate with ChromaDB
        await this.client.heartbeat();
        console.log('✅ ChromaDB client connection verified');
        
        // Try to get existing collection
        this.collection = await this.client.getCollection({
          name: collectionName
        });
        console.log(`Connected to existing Chroma collection: ${collectionName}`);
      } catch (error) {
        console.log('Creating new collection...');
        // Create new collection if it doesn't exist
        this.collection = await this.client.createCollection({
          name: collectionName,
          metadata: { 'hnsw:space': 'cosine' }
        });
        console.log(`Created new Chroma collection: ${collectionName}`);
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Chroma collection:', error);
      
      // Mark service as unavailable but don't crash the server
      this.client = null;
      this.collection = null;
      this.initialized = false;
      
      throw new ChromaConnectionError(`ChromaDB unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addDocuments(documents: ChromaDocument[]): Promise<void> {
    if (!this.collection) {
      console.warn('ChromaDB not available - skipping document addition');
      return;
    }
    
    try {
      const ids = documents.map(doc => doc.id);
      const contents = documents.map(doc => doc.content);
      const embeddings = documents.map(doc => doc.embedding).filter(Boolean) as number[][];
      const metadatas = documents.map(doc => doc.metadata);

      await this.collection.add({
        ids,
        documents: contents,
        embeddings: embeddings.length === documents.length ? embeddings : undefined,
        metadatas
      });

      console.log(`Added ${documents.length} documents to Chroma collection`);
    } catch (error) {
      console.error('Error adding documents to ChromaDB:', error);
      throw error;
    }
  }

  async searchSimilar(
    queryEmbedding: number[],
    nResults: number = 10,
    tagFilter?: string[]
  ): Promise<SearchResult[]> {
    if (!this.collection) {
      console.warn('ChromaDB not available - returning empty search results');
      return [];
    }

    try {
      const whereFilter = tagFilter && tagFilter.length > 0 
        ? { tags: { $in: tagFilter } }
        : undefined;

      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults,
        where: whereFilter
      });

      if (!results.ids[0] || results.ids[0].length === 0) {
        return [];
      }

      return results.ids[0].map((id: any, index: number) => ({
        id: id as string,
        content: results.documents?.[0]?.[index] as string || '',
        metadata: results.metadatas?.[0]?.[index] as Record<string, any> || {},
        distance: results.distances?.[0]?.[index] || 0
      }));
    } catch (error) {
      console.error('Error searching ChromaDB:', error);
      return [];
    }
  }

  async deleteDocument(id: string): Promise<void> {
    if (!this.collection) {
      console.warn('ChromaDB not available - skipping document deletion');
      return;
    }
    
    try {
      await this.collection.delete({
        ids: [id]
      });
    } catch (error) {
      console.error('Error deleting document from ChromaDB:', error);
      throw error;
    }
  }

  async getCollectionCount(): Promise<number> {
    if (!this.collection) {
      console.warn('ChromaDB not available - returning 0 count');
      return 0;
    }
    
    try {
      return await this.collection.count();
    } catch (error) {
      console.error('Error getting collection count:', error);
      return 0;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.collection) return false;
      await this.collection.count();
      return true;
    } catch (error) {
      console.error('Chroma health check failed:', error);
      return false;
    }
  }
}