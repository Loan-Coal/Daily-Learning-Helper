
import express from 'express';
import {
  startQuiz,
  submitAnswer,
  nextQuestion,
  prevQuestion,
  getQuizSession
} from '../controllers/quizController';

const router = express.Router();

// POST /api/quiz/start - Start a new quiz session
router.post('/quiz/start', startQuiz);
// POST /api/quiz/answer - Submit answer for current question
router.post('/quiz/answer', submitAnswer);
// POST /api/quiz/next - Navigate to next question
router.post('/quiz/next', nextQuestion);
// POST /api/quiz/prev - Navigate to previous question
router.post('/quiz/prev', prevQuestion);
// GET /api/quiz/:sessionId - Get full session state
router.get('/quiz/:sessionId', getQuizSession);


export default router;