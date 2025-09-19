import { Request, Response } from 'express';
import { startQuizSession } from '../services/quizService';
import { createResponse } from '../utils/createResponse';

export async function startQuiz(req: Request, res: Response) {
  try {
    const { tags = [], questionCount = 10 } = req.body;
    if (!Array.isArray(tags) || typeof questionCount !== 'number') {
      return res.status(400).json(createResponse(false, null, {
        code: 'INVALID_INPUT',
        message: 'tags must be an array and questionCount a number'
      }));
    }
    const result = await startQuizSession(tags, questionCount);
    return res.json(createResponse(true, result));
  } catch (error) {
    console.error('Start quiz error:', error);
    return res.status(500).json(createResponse(false, null, {
      code: 'QUIZ_START_ERROR',
      message: error instanceof Error ? error.message : 'Failed to start quiz session'
    }));
  }
}

export async function submitAnswer(req: Request, res: Response) {
  try {
    const { sessionId, questionIndex, selectedOption } = req.body;
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

export async function nextQuestion(req: Request, res: Response) {
  try {
    const { sessionId } = req.body;
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

export async function prevQuestion(req: Request, res: Response) {
  try {
    const { sessionId } = req.body;
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

export async function getQuizSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
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
