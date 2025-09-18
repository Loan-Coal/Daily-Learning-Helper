import express from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const prisma = new PrismaClient();

// API response utility
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

const createResponse = <T>(success: boolean, data?: T, error?: { code: string; message: string }): ApiResponse<T> => ({
  success,
  data,
  error
});

// Mock questions for now (placeholder for LLM integration)
const MOCK_QUESTIONS = [
  {
    id: 1,
    question: "What is the primary purpose of object-oriented programming?",
    options: [
      "To make code run faster",
      "To organize code into reusable objects with properties and methods",
      "To reduce memory usage",
      "To eliminate the need for functions"
    ],
    correctAnswer: 1,
    explanation: "Object-oriented programming helps organize code into reusable objects that encapsulate data and behavior."
  },
  {
    id: 2,
    question: "Which of the following is NOT a fundamental principle of OOP?",
    options: [
      "Encapsulation",
      "Inheritance",
      "Polymorphism",
      "Compilation"
    ],
    correctAnswer: 3,
    explanation: "Compilation is a process, not a fundamental principle of object-oriented programming."
  },
  {
    id: 3,
    question: "What does 'inheritance' mean in programming?",
    options: [
      "Copying code from one file to another",
      "A class acquiring properties and methods from another class",
      "Deleting unused variables",
      "Optimizing code performance"
    ],
    correctAnswer: 1,
    explanation: "Inheritance allows a class to acquire properties and methods from a parent class."
  },
  {
    id: 4,
    question: "What is encapsulation in OOP?",
    options: [
      "Hiding internal implementation details",
      "Creating multiple classes",
      "Writing documentation",
      "Testing code"
    ],
    correctAnswer: 0,
    explanation: "Encapsulation is the practice of hiding internal implementation details and exposing only necessary interfaces."
  },
  {
    id: 5,
    question: "What is polymorphism?",
    options: [
      "Having multiple constructors",
      "Using many programming languages",
      "Objects taking multiple forms or behaviors",
      "Creating backup copies of code"
    ],
    correctAnswer: 2,
    explanation: "Polymorphism allows objects to take multiple forms and behave differently based on their type."
  }
];

// POST /api/quiz/start - Start a new quiz session
router.post('/quiz/start', async (req, res) => {
  try {
    const { tags = [], questionCount = 10 } = req.body;
    
    // For now, use mock questions
    // TODO: Generate questions from uploaded files based on tags
    const selectedQuestions = MOCK_QUESTIONS.slice(0, Math.min(questionCount, MOCK_QUESTIONS.length));
    
    // Get relevant file IDs based on tags (placeholder logic)
    let fileIds: string[] = [];
    if (tags.length > 0) {
      const files = await prisma.file.findMany({
        where: {
          tags: {
            contains: tags[0] // Simplified tag matching
          }
        },
        select: { id: true }
      });
      fileIds = files.map((f: any) => f.id);
    }

    // Create quiz session
    const session = await prisma.quizSession.create({
      data: {
        fileIds: JSON.stringify(fileIds),
        tags: JSON.stringify(tags),
        questionsJSON: JSON.stringify(selectedQuestions),
        currentIndex: 0,
        answers: JSON.stringify([])
      }
    });

    return res.json(createResponse(true, {
      sessionId: session.id,
      totalQuestions: selectedQuestions.length,
      currentQuestion: selectedQuestions[0] || null,
      currentIndex: 0
    }));
  } catch (error) {
    console.error('Start quiz error:', error);
    return res.status(500).json(createResponse(false, null, {
      code: 'QUIZ_START_ERROR',
      message: 'Failed to start quiz session'
    }));
  }
});

// POST /api/quiz/answer - Submit answer for current question
router.post('/quiz/answer', async (req, res) => {
  try {
    const { sessionId, questionIndex, selectedOption } = req.body;

    if (!sessionId || questionIndex === undefined || selectedOption === undefined) {
      return res.status(400).json(createResponse(false, null, {
        code: 'MISSING_FIELDS',
        message: 'Session ID, question index, and selected option are required'
      }));
    }

    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json(createResponse(false, null, {
        code: 'SESSION_NOT_FOUND',
        message: 'Quiz session not found'
      }));
    }

    const questions = JSON.parse(session.questionsJSON);
    const answers = JSON.parse(session.answers);
    
    if (questionIndex >= questions.length) {
      return res.status(400).json(createResponse(false, null, {
        code: 'INVALID_QUESTION_INDEX',
        message: 'Invalid question index'
      }));
    }

    const question = questions[questionIndex];
    const isCorrect = selectedOption === question.correctAnswer;

    // Update answers array
    answers[questionIndex] = {
      questionId: question.id,
      selectedOption,
      isCorrect,
      answeredAt: new Date().toISOString()
    };

    // Update session in database
    await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        answers: JSON.stringify(answers)
      }
    });

    return res.json(createResponse(true, {
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      selectedOption
    }));
  } catch (error) {
    console.error('Answer quiz error:', error);
    return res.status(500).json(createResponse(false, null, {
      code: 'QUIZ_ANSWER_ERROR',
      message: 'Failed to process answer'
    }));
  }
});

// POST /api/quiz/next - Navigate to next question
router.post('/quiz/next', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json(createResponse(false, null, {
        code: 'MISSING_SESSION_ID',
        message: 'Session ID is required'
      }));
    }

    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json(createResponse(false, null, {
        code: 'SESSION_NOT_FOUND',
        message: 'Quiz session not found'
      }));
    }

    const questions = JSON.parse(session.questionsJSON);
    const newIndex = Math.min(session.currentIndex + 1, questions.length - 1);

    // Update current index
    await prisma.quizSession.update({
      where: { id: sessionId },
      data: { currentIndex: newIndex }
    });

    const currentQuestion = newIndex < questions.length ? questions[newIndex] : null;

    return res.json(createResponse(true, {
      currentQuestion,
      currentIndex: newIndex,
      totalQuestions: questions.length,
      isLastQuestion: newIndex === questions.length - 1
    }));
  } catch (error) {
    console.error('Next question error:', error);
    return res.status(500).json(createResponse(false, null, {
      code: 'QUIZ_NAVIGATION_ERROR',
      message: 'Failed to navigate to next question'
    }));
  }
});

// POST /api/quiz/prev - Navigate to previous question
router.post('/quiz/prev', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json(createResponse(false, null, {
        code: 'MISSING_SESSION_ID',
        message: 'Session ID is required'
      }));
    }

    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json(createResponse(false, null, {
        code: 'SESSION_NOT_FOUND',
        message: 'Quiz session not found'
      }));
    }

    const questions = JSON.parse(session.questionsJSON);
    const newIndex = Math.max(session.currentIndex - 1, 0);

    // Update current index
    await prisma.quizSession.update({
      where: { id: sessionId },
      data: { currentIndex: newIndex }
    });

    const currentQuestion = questions[newIndex];

    return res.json(createResponse(true, {
      currentQuestion,
      currentIndex: newIndex,
      totalQuestions: questions.length,
      isFirstQuestion: newIndex === 0
    }));
  } catch (error) {
    console.error('Previous question error:', error);
    return res.status(500).json(createResponse(false, null, {
      code: 'QUIZ_NAVIGATION_ERROR',
      message: 'Failed to navigate to previous question'
    }));
  }
});

// GET /api/quiz/:sessionId - Get full session state
router.get('/quiz/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json(createResponse(false, null, {
        code: 'SESSION_NOT_FOUND',
        message: 'Quiz session not found'
      }));
    }

    const questions = JSON.parse(session.questionsJSON);
    const answers = JSON.parse(session.answers);
    const currentQuestion = questions[session.currentIndex];

    return res.json(createResponse(true, {
      sessionId: session.id,
      createdAt: session.createdAt,
      currentIndex: session.currentIndex,
      totalQuestions: questions.length,
      currentQuestion,
      answers,
      tags: JSON.parse(session.tags),
      fileIds: JSON.parse(session.fileIds)
    }));
  } catch (error) {
    console.error('Get session error:', error);
    return res.status(500).json(createResponse(false, null, {
      code: 'SESSION_FETCH_ERROR',
      message: 'Failed to fetch session data'
    }));
  }
});

export default router;