import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ChromaService } from './services/ChromaService';
import { EmbeddingService } from './services/EmbeddingService';
import { authMiddleware } from './middleware/authMiddleware';
import { createErrorResponse, createSuccessResponse } from './utils/responseHandler';

// Import routes
const documentsRoute = require('./routes/documents').default || require('./routes/documents');
const questionsRoute = require('./routes/questions').default || require('./routes/questions');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.MAIN_BACKEND_URL || 'http://localhost:3001',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint (no auth required)
app.get('/health', async (req, res) => {
  try {
    const chromaService = ChromaService.getInstance();
    const embeddingService = new EmbeddingService();
    
    const chromaHealth = await chromaService.healthCheck();
    const embeddingHealth = await embeddingService.healthCheck();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        chroma: chromaHealth ? 'healthy' : 'unhealthy',
        embeddings: embeddingHealth ? 'healthy' : 'unhealthy',
        mixtral: process.env.MIXTRAL_API_KEY ? 'configured' : 'not-configured'
      },
      version: '1.0.0'
    };
    
    const statusCode = chromaHealth && embeddingHealth ? 200 : 503;
    res.status(statusCode).json(createSuccessResponse(health));
    
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json(createErrorResponse('Health check failed'));
  }
});

// API routes (protected)
app.use('/api/documents', authMiddleware, documentsRoute);
app.use('/api/questions', authMiddleware, questionsRoute);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json(createErrorResponse('Endpoint not found'));
});

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json(createErrorResponse('Internal server error'));
});

// Server initialization
async function startServer() {
  try {
    console.log('🚀 Starting MCP Server...');
    
    // Initialize Chroma service (optional - continue if it fails)
    console.log('📊 Initializing Chroma vector database...');
    try {
      const chromaService = ChromaService.getInstance();
      await chromaService.initialize();
      console.log('✅ Chroma vector database initialized successfully');
    } catch (chromaError) {
      console.warn('⚠️  Chroma initialization failed - continuing without vector search:', chromaError instanceof Error ? chromaError.message : 'Unknown error');
      console.warn('📝 Note: Document processing and vector search features will be limited');
    }
    
    // Test embedding service (optional)
    console.log('🧮 Testing embedding service...');
    try {
      const embeddingService = new EmbeddingService();
      const testHealthy = await embeddingService.healthCheck();
      
      if (!testHealthy) {
        console.warn('⚠️  Embedding service health check failed - check HUGGINGFACE_API_KEY');
      } else {
        console.log('✅ Embedding service is healthy');
      }
    } catch (embeddingError) {
      console.warn('⚠️  Embedding service test failed:', embeddingError instanceof Error ? embeddingError.message : 'Unknown error');
    }
    
    // Test Mixtral connection if configured
    if (process.env.MIXTRAL_API_KEY) {
      console.log('🤖 Testing Mixtral connection...');
      // QuestionGenerationService test would go here
    } else {
      console.warn('⚠️  Mixtral API key not configured - will fall back to mock questions');
    }
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`✅ MCP Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📖 API docs: http://localhost:${PORT}/api/docs (coming soon)`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

export default app;