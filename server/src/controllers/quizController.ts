import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { startQuizSession } from '../services/quizService';
import { createResponse } from '../utils/createResponse';

export async function startQuiz(req: AuthRequest, res: Response) {
  try {
    const { tags = [], questionCount = 10 } = req.body;
    
    // Get user ID and auth token
    const userId = req.user?.id || 'anonymous';
    const authToken = req.headers.authorization?.replace('Bearer ', '') || '';
    
    if (!Array.isArray(tags) || typeof questionCount !== 'number') {
      return res.status(400).json(createResponse(false, null, {
        code: 'INVALID_INPUT',
        message: 'tags must be an array and questionCount a number'
      }));
    }

    if (tags.length === 0) {
      return res.status(400).json(createResponse(false, null, {
        code: 'MISSING_TAGS',
        message: 'At least one tag is required for quiz generation'
      }));
    }

    console.log(`Starting quiz for user ${userId} with tags: ${tags.join(', ')}`);
    
    const result = await startQuizSession(tags, questionCount, userId, authToken);
    
    return res.json(createResponse(true, {
      ...result,
      message: result.generationStatus === 'fallback' 
        ? 'Using backup questions - AI generation temporarily unavailable'
        : 'Questions generated successfully'
    }));

  } catch (error) {
    console.error('Start quiz error:', error);
    return res.status(500).json(createResponse(false, null, {
      code: 'QUIZ_START_ERROR',
      message: error instanceof Error ? error.message : 'Failed to start quiz session'
    }));
  }
}

export async function submitAnswer(req: AuthRequest, res: Response) {
  try {
  const { sessionId, questionIndex, selectedOption } = req.body || {};
    if (!sessionId || questionIndex === undefined || selectedOption === undefined) {
      return res.status(400).json(createResponse(false, null, {
        code: 'MISSING_FIELDS',
        message: 'Session ID, question index, and selected option are required'
      }));
    }
    const result = await require('../services/quizService').submitQuizAnswer(sessionId, questionIndex, selectedOption);
    return res.json(createResponse(true, result));
  } catch (error) {
    console.error('Answer quiz error:', error);
    return res.status(500).json(createResponse(false, null, {
      code: 'QUIZ_ANSWER_ERROR',
      message: error instanceof Error ? error.message : 'Failed to process answer'
    }));
  }
}

export async function nextQuestion(req: AuthRequest, res: Response) {
  try {
  const { sessionId } = req.body || {};
    if (!sessionId) {
      return res.status(400).json(createResponse(false, null, {
        code: 'MISSING_SESSION_ID',
        message: 'Session ID is required'
      }));
    }
    const result = await require('../services/quizService').nextQuizQuestion(sessionId);
    return res.json(createResponse(true, result));
  } catch (error) {
    console.error('Next question error:', error);
    return res.status(500).json(createResponse(false, null, {
      code: 'QUIZ_NAVIGATION_ERROR',
      message: error instanceof Error ? error.message : 'Failed to navigate to next question'
    }));
  }
}

export async function prevQuestion(req: AuthRequest, res: Response) {
  try {
  const { sessionId } = req.body || {};
    if (!sessionId) {
      return res.status(400).json(createResponse(false, null, {
        code: 'MISSING_SESSION_ID',
        message: 'Session ID is required'
      }));
    }
    const result = await require('../services/quizService').prevQuizQuestion(sessionId);
    return res.json(createResponse(true, result));
  } catch (error) {
    console.error('Previous question error:', error);
    return res.status(500).json(createResponse(false, null, {
      code: 'QUIZ_NAVIGATION_ERROR',
      message: error instanceof Error ? error.message : 'Failed to navigate to previous question'
    }));
  }
}

export async function getQuizSession(req: AuthRequest, res: Response) {
  try {
  const { sessionId } = req.params || {};
    if (!sessionId) {
      return res.status(400).json(createResponse(false, null, {
        code: 'MISSING_SESSION_ID',
        message: 'Session ID is required'
      }));
    }
    const result = await require('../services/quizService').getQuizSessionById(sessionId);
    return res.json(createResponse(true, result));
  } catch (error) {
    console.error('Get session error:', error);
    return res.status(500).json(createResponse(false, null, {
      code: 'SESSION_FETCH_ERROR',
      message: error instanceof Error ? error.message : 'Failed to fetch session data'
    }));
  }
}
