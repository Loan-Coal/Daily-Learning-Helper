import express from 'express';
import multer from 'multer';
import { ChromaService } from '../services/ChromaService';
import { EmbeddingService } from '../services/EmbeddingService';
import { ChunkingService } from '../services/ChunkingService';
import { MetadataProvider } from '../providers/MetadataProvider';
import { VectorSearchProvider } from '../providers/VectorSearchProvider';
import { createSuccessResponse, createErrorResponse, handleAsyncRoute } from '../utils/responseHandler';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Services
const chromaService = ChromaService.getInstance();
const embeddingService = new EmbeddingService();
const chunkingService = new ChunkingService();
const metadataProvider = new MetadataProvider();
const vectorSearchProvider = new VectorSearchProvider();

// Process uploaded document
router.post('/process', upload.single('file'), handleAsyncRoute(async (req: any, res) => {
  try {
    const file = req.file;
    const userId = req.user.userId;
    
    if (!file) {
      return res.status(400).json(createErrorResponse('No file provided'));
    }

    console.log(`Processing file: ${file.originalname} for user: ${userId}`);

    // Extract text from file
    const extractedText = await chunkingService.extractTextFromFile(
      file.buffer, 
      file.mimetype, 
      file.originalname
    );

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json(createErrorResponse('No text could be extracted from file'));
    }

    // For now, we'll simulate a file ID since we need the full integration
    const fileId = `temp_${Date.now()}_${userId}`;
    const tags = req.body.tags ? JSON.parse(req.body.tags) : [];

    // Chunk the text
    const chunks = chunkingService.chunkText(extractedText, fileId, {
      originalName: file.originalname,
      mimeType: file.mimetype,
      tags,
      userId
    });

    console.log(`Created ${chunks.length} chunks from ${file.originalname}`);

    // Generate embeddings for chunks
    const embeddings = await embeddingService.generateBatchEmbeddings(
      chunks.map(chunk => chunk.content)
    );

    // Prepare documents for Chroma
    const chromaDocuments = chunks.map((chunk, index) => ({
      id: chunk.id,
      content: chunk.content,
      embedding: embeddings[index].embedding,
      metadata: {
        ...chunk.metadata,
        chunkIndex: chunk.chunkIndex,
        startIndex: chunk.startIndex,
        endIndex: chunk.endIndex
      }
    }));

    // Store in Chroma
    await chromaService.addDocuments(chromaDocuments);

    // Return processing results
    res.json(createSuccessResponse({
      fileId,
      originalName: file.originalname,
      chunksCreated: chunks.length,
      totalTokens: embeddings.reduce((sum, emb) => sum + emb.tokens, 0),
      textLength: extractedText.length,
      processingTime: Date.now() - parseInt(fileId.split('_')[1])
    }));

  } catch (error) {
    console.error('Document processing failed:', error);
    res.status(500).json(createErrorResponse('Document processing failed'));
  }
}));

// Search documents
router.post('/search', handleAsyncRoute(async (req, res) => {
  try {
    const { query, tags, maxResults = 10 } = req.body;
    
    if (!query && (!tags || tags.length === 0)) {
      return res.status(400).json(createErrorResponse('Query or tags required'));
    }

    const results = await vectorSearchProvider.searchByText(
      query || `Topics: ${tags.join(', ')}`,
      maxResults,
      tags
    );

    res.json(createSuccessResponse({
      results,
      query,
      tags,
      count: results.length
    }));

  } catch (error) {
    console.error('Document search failed:', error);
    res.status(500).json(createErrorResponse('Document search failed'));
  }
}));

// Get document metadata
router.get('/metadata/:documentId', handleAsyncRoute(async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const metadata = await metadataProvider.getDocumentMetadata(documentId);
    
    if (!metadata) {
      return res.status(404).json(createErrorResponse('Document not found'));
    }

    res.json(createSuccessResponse(metadata));

  } catch (error) {
    console.error('Failed to get document metadata:', error);
    res.status(500).json(createErrorResponse('Failed to get document metadata'));
  }
}));

// Get user documents
router.get('/user/:userId', handleAsyncRoute(async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;
    
    // Users can only access their own documents
    if (userId !== requestingUserId) {
      return res.status(403).json(createErrorResponse('Access denied'));
    }

    const documents = await metadataProvider.getUserDocuments(userId);

    res.json(createSuccessResponse({
      documents,
      count: documents.length
    }));

  } catch (error) {
    console.error('Failed to get user documents:', error);
    res.status(500).json(createErrorResponse('Failed to get user documents'));
  }
}));

// Get processing statistics
router.get('/stats', handleAsyncRoute(async (req, res) => {
  try {
    const stats = await metadataProvider.getProcessingStats();
    const collectionCount = await chromaService.getCollectionCount();
    
    res.json(createSuccessResponse({
      ...stats,
      vectorDocuments: collectionCount,
      chunkingConfig: chunkingService.getChunkingConfig()
    }));

  } catch (error) {
    console.error('Failed to get processing stats:', error);
    res.status(500).json(createErrorResponse('Failed to get processing stats'));
  }
}));

export default router;