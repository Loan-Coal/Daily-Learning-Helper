import express from 'express';
import { QuestionGenerationService } from '../services/QuestionGenerationService';
import { VectorSearchProvider } from '../providers/VectorSearchProvider';
import { QuestionHistoryProvider } from '../providers/QuestionHistoryProvider';
import { createSuccessResponse, createErrorResponse, handleAsyncRoute } from '../utils/responseHandler';

const router = express.Router();

// Services
const questionGenerationService = new QuestionGenerationService();
const vectorSearchProvider = new VectorSearchProvider();
const questionHistoryProvider = new QuestionHistoryProvider();

// Generate questions for a quiz session
router.post('/generate', handleAsyncRoute(async (req, res) => {
  try {
    const { tags, questionCount = 5, sessionId, difficulty = 'mixed', semanticQuery } = req.body;
    
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json(createErrorResponse('Tags array is required'));
    }
    
    if (!sessionId) {
      return res.status(400).json(createErrorResponse('Session ID is required'));
    }
    
    console.log(`Generating ${questionCount} questions for session ${sessionId} with tags: ${tags.join(', ')}`);
    
    // Mark session as generating
    await questionHistoryProvider.updateQuestionSetStatus(sessionId, 'generating');
    
    try {
      // Get relevant contexts using vector search
      const maxContexts = Math.min(questionCount * 2, 20); // Get more contexts than questions
      const contexts = await vectorSearchProvider.getRelevantContexts(
        tags,
        maxContexts,
        semanticQuery
      );
      
      if (contexts.length === 0) {
        await questionHistoryProvider.updateQuestionSetStatus(sessionId, 'failed');
        return res.status(400).json(createErrorResponse(
          'No relevant content found for the specified tags. Please upload documents or try different tags.'
        ));
      }
      
      console.log(`Found ${contexts.length} relevant contexts for question generation`);
      
      // Generate questions using Mixtral (or fail gracefully)
      let questions;
      try {
        if (!questionGenerationService.isConfigured()) {
          throw new Error('Mixtral not configured');
        }
        
        questions = await questionGenerationService.generateQuestions({
          contexts: contexts.map(c => c.content),
          tags,
          questionCount,
          difficulty
        });
        
      } catch (mixtralError) {
        console.error('Mixtral generation failed:', mixtralError);
        await questionHistoryProvider.updateQuestionSetStatus(sessionId, 'failed');
        
        // Return error that will trigger fallback in the main backend
        return res.status(503).json(createErrorResponse(
          'AI question generation temporarily unavailable',
          'MIXTRAL_UNAVAILABLE',
          { reason: mixtralError instanceof Error ? mixtralError.message : 'Unknown error' }
        ));
      }
      
      // Filter out potential duplicates
      const uniqueQuestions = await questionHistoryProvider.avoidDuplicateQuestions(
        questions,
        tags,
        0.8 // 80% similarity threshold
      );
      
      // If we filtered out too many, pad with some originals
      const finalQuestions = uniqueQuestions.length >= questionCount 
        ? uniqueQuestions.slice(0, questionCount)
        : [...uniqueQuestions, ...questions.slice(0, questionCount - uniqueQuestions.length)];
      
      // Save the question set
      const sourceChunkIds = contexts.map(c => c.id);
      await questionHistoryProvider.saveQuestionSet(
        sessionId,
        finalQuestions,
        tags,
        sourceChunkIds
      );
      
      console.log(`Successfully generated ${finalQuestions.length} questions for session ${sessionId}`);
      
      res.json(createSuccessResponse({
        sessionId,
        questions: finalQuestions,
        questionCount: finalQuestions.length,
        sourceContexts: contexts.length,
        tags,
        difficulty,
        generatedAt: new Date().toISOString()
      }));
      
    } catch (error) {
      // Mark as failed if any step fails
      await questionHistoryProvider.updateQuestionSetStatus(sessionId, 'failed');
      throw error;
    }
    
  } catch (error) {
    console.error('Question generation failed:', error);
    res.status(500).json(createErrorResponse(
      'Question generation failed',
      'GENERATION_ERROR',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    ));
  }
}));

// Get cached questions for a session
router.get('/session/:sessionId', handleAsyncRoute(async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const questionSet = await questionHistoryProvider.getQuestionSet(sessionId);
    
    if (!questionSet) {
      return res.status(404).json(createErrorResponse('Question set not found'));
    }
    
    res.json(createSuccessResponse(questionSet));
    
  } catch (error) {
    console.error('Failed to get question set:', error);
    res.status(500).json(createErrorResponse('Failed to get question set'));
  }
}));

// Get question generation status for a session
router.get('/status/:sessionId', handleAsyncRoute(async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const questionSet = await questionHistoryProvider.getQuestionSet(sessionId);
    
    if (!questionSet) {
      return res.status(404).json(createErrorResponse('Session not found'));
    }
    
    res.json(createSuccessResponse({
      sessionId,
      status: 'ready', // If we found it, it's ready
      questionCount: questionSet.questions.length,
      createdAt: questionSet.createdAt
    }));
    
  } catch (error) {
    console.error('Failed to get session status:', error);
    res.status(500).json(createErrorResponse('Failed to get session status'));
  }
}));

// Test Mixtral connection
router.get('/test-mixtral', handleAsyncRoute(async (req, res) => {
  try {
    const isConfigured = questionGenerationService.isConfigured();
    
    if (!isConfigured) {
      return res.json(createSuccessResponse({
        configured: false,
        connection: false,
        message: 'Mixtral API key not configured'
      }));
    }
    
    const connectionTest = await questionGenerationService.testConnection();
    
    res.json(createSuccessResponse({
      configured: true,
      connection: connectionTest,
      message: connectionTest 
        ? 'Mixtral connection successful' 
        : 'Mixtral connection failed'
    }));
    
  } catch (error) {
    console.error('Mixtral connection test failed:', error);
    res.status(500).json(createErrorResponse('Connection test failed'));
  }
}));

// Get question generation statistics
router.get('/stats', handleAsyncRoute(async (req, res) => {
  try {
    const stats = await questionHistoryProvider.getQuestionSetStats();
    
    res.json(createSuccessResponse({
      ...stats,
      mixtralConfigured: questionGenerationService.isConfigured(),
      timestamp: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error('Failed to get question stats:', error);
    res.status(500).json(createErrorResponse('Failed to get question stats'));
  }
}));

export default router;