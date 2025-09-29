import prisma from '../prisma/client';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3002';

export interface QuizSessionResult {
  sessionId: string;
  totalQuestions: number;
  currentQuestion: any;
  currentIndex: number;
  generationStatus?: 'generating' | 'ready' | 'failed' | 'fallback';
}

interface MCPGenerationRequest {
  tags: string[];
  questionCount: number;
  sessionId: string;
  difficulty?: string;
  semanticQuery?: string;
}

interface MCPGenerationResponse {
  success: boolean;
  data?: {
    sessionId: string;
    questions: any[];
    questionCount: number;
    tags: string[];
  };
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export async function startQuizSession(
  tags: string[], 
  questionCount: number, 
  userId: string,
  authToken: string
): Promise<QuizSessionResult> {
  const sessionId = generateSessionId();
  
  console.log(`Starting quiz session ${sessionId} for user ${userId} with tags: ${tags.join(', ')}`);
  
  try {
    // First try MCP server
    if (await isMCPServerAvailable()) {
      console.log('Attempting question generation with MCP server...');
      
      const mcpQuestions = await generateQuestionsWithMCP({
        tags,
        questionCount,
        sessionId,
        difficulty: 'mixed'
      }, authToken);
      
      if (mcpQuestions && mcpQuestions.length > 0) {
        console.log(`Successfully generated ${mcpQuestions.length} questions via MCP`);
        
        const session = await createQuizSession(sessionId, tags, mcpQuestions);
        
        return {
          sessionId,
          totalQuestions: mcpQuestions.length,
          currentQuestion: mcpQuestions[0] || null,
          currentIndex: 0,
          generationStatus: 'ready'
        };
      }
    }
    
    // Fall back to mock questions
    console.log('Falling back to mock questions...');
    const mockQuestions = await generateMockQuestions(tags, questionCount);
    
    const session = await createQuizSession(sessionId, tags, mockQuestions);
    
    return {
      sessionId,
      totalQuestions: mockQuestions.length,
      currentQuestion: mockQuestions[0] || null,
      currentIndex: 0,
      generationStatus: 'fallback'
    };
    
  } catch (error) {
    console.error('Quiz session creation failed:', error);
    throw new Error(`Failed to create quiz session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to generate session ID
function generateSessionId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to check if MCP server is available
async function isMCPServerAvailable(): Promise<boolean> {
  try {
    const response = await axios.get(`${MCP_SERVER_URL}/health`, {
      timeout: 5000
    });
    return response.status === 200 && response.data.success;
  } catch (error) {
    console.log('MCP server not available:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

// Generate questions using MCP server
async function generateQuestionsWithMCP(
  request: MCPGenerationRequest,
  authToken: string
): Promise<any[] | null> {
  try {
    const response = await axios.post<MCPGenerationResponse>(
      `${MCP_SERVER_URL}/api/questions/generate`,
      request,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 2 minutes for question generation
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data.questions;
    } else {
      console.error('MCP question generation failed:', response.data.error);
      return null;
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('MCP server error:', error.response?.data || error.message);
      
      // If it's a Mixtral unavailable error, let calling code handle fallback
      if (error.response?.data?.error?.code === 'MIXTRAL_UNAVAILABLE') {
        console.log('Mixtral unavailable, will fall back to mock questions');
      }
    } else {
      console.error('Unexpected error calling MCP server:', error);
    }
    return null;
  }
}

// Generate mock questions from JSON files
async function generateMockQuestions(tags: string[], questionCount: number): Promise<any[]> {
  try {
    // Map tags to mock files with more flexible matching
    const mockFileMapping: Record<string, string> = {
      'math': 'math.json',
      'mathematics': 'math.json',
      'algebra': 'math.json',
      'calculus': 'math.json',
      'geometry': 'math.json',
      'science': 'science.json',
      'physics': 'science.json',
      'chemistry': 'science.json',
      'biology': 'science.json',
      'general': 'science.json', // fallback for general topics
      'default': 'science.json'
    };

    // Find the best mock file for the tags
    let mockFile = 'science.json'; // default
    for (const tag of tags) {
      const lowerTag = tag.toLowerCase();
      if (mockFileMapping[lowerTag]) {
        mockFile = mockFileMapping[lowerTag];
        break;
      }
      // Also check if tag contains keywords
      if (lowerTag.includes('math') || lowerTag.includes('calculation')) {
        mockFile = 'math.json';
        break;
      }
      if (lowerTag.includes('science') || lowerTag.includes('physics') || lowerTag.includes('chemistry')) {
        mockFile = 'science.json';
        break;
      }
    }

    console.log(`Looking for mock file: ${mockFile} for tags: ${tags.join(', ')}`);

    // Try multiple possible paths
    const possiblePaths = [
      path.join(process.cwd(), '..', 'fixtures', 'questions', mockFile),
      path.join(__dirname, '..', '..', '..', 'fixtures', 'questions', mockFile),
      path.join(__dirname, '..', '..', 'fixtures', 'questions', mockFile),
      path.join(process.cwd(), 'fixtures', 'questions', mockFile),
      path.join(__dirname, '..', 'fixtures', 'questions', mockFile)
    ];

    console.log('Current working directory:', process.cwd());
    console.log('__dirname:', __dirname);

    let mockData = null;
    let usedPath = '';

    for (const mockFilePath of possiblePaths) {
      console.log(`Trying path: ${mockFilePath}`);
      if (fs.existsSync(mockFilePath)) {
        console.log(`Found mock file at: ${mockFilePath}`);
        usedPath = mockFilePath;
        mockData = JSON.parse(fs.readFileSync(mockFilePath, 'utf-8'));
        break;
      }
    }

    if (!mockData) {
      console.error(`Mock file ${mockFile} not found in any of the expected locations`);
      console.error('Searched paths:', possiblePaths);
      return generateDefaultQuestions(questionCount);
    }

    const questions = mockData.questions || mockData || [];
    console.log(`Loaded ${questions.length} questions from ${usedPath}`);
    
    if (questions.length === 0) {
      console.warn('Mock file contains no questions, using defaults');
      return generateDefaultQuestions(questionCount);
    }
    
    // Shuffle and take the requested count
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const result = shuffled.slice(0, questionCount);
    console.log(`Returning ${result.length} mock questions`);
    return result;

  } catch (error) {
    console.error('Error loading mock questions:', error);
    return generateDefaultQuestions(questionCount);
  }
}

// Generate basic default questions as last resort
function generateDefaultQuestions(count: number): any[] {
  const defaultQuestions = [
    {
      question: "What is the primary purpose of this learning system?",
      options: ["Entertainment", "Education", "Gaming", "Social networking"],
      correctAnswer: 1,
      explanation: "This is an educational platform designed for learning and knowledge assessment."
    },
    {
      question: "How are questions typically generated in modern learning systems?",
      options: ["Manually only", "AI-assisted generation", "Random selection", "User submissions"],
      correctAnswer: 1,
      explanation: "Modern systems use AI to generate contextually relevant questions from learning materials."
    },
    {
      question: "What is the main benefit of using tags to organize content?",
      options: ["Visual appeal", "Better search and categorization", "File compression", "Faster loading"],
      correctAnswer: 1,
      explanation: "Tags help organize content into categories making it easier to search and filter information."
    },
    {
      question: "In educational technology, what does 'adaptive learning' mean?",
      options: ["Fixed curriculum for all", "Personalized learning paths", "Group-based only", "Text-only content"],
      correctAnswer: 1,
      explanation: "Adaptive learning systems adjust content and pace based on individual learner progress and needs."
    },
    {
      question: "What is the purpose of quiz feedback in learning systems?",
      options: ["To punish mistakes", "To provide learning reinforcement", "To collect user data", "To increase difficulty"],
      correctAnswer: 1,
      explanation: "Feedback helps reinforce correct understanding and clarify misconceptions for better learning."
    }
  ];

  // Repeat questions if needed, but try to avoid immediate repetition
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push(defaultQuestions[i % defaultQuestions.length]);
  }
  
  return questions;
}

// Create quiz session in database
async function createQuizSession(sessionId: string, tags: string[], questions: any[]): Promise<any> {
  // Get file IDs by tags for compatibility
  let fileIds: string[] = [];
  if (tags.length > 0) {
    try {
      const files = await prisma.file.findMany({
        where: { 
          tags: { 
            contains: tags[0] 
          } 
        },
        select: { id: true }
      });
      fileIds = files.map((f: any) => f.id);
    } catch (error) {
      console.log('Could not fetch file IDs:', error);
      // Continue without file IDs
    }
  }

  return await prisma.quizSession.create({
    data: {
      id: sessionId, // Use our custom session ID
      fileIds: JSON.stringify(fileIds),
      tags: JSON.stringify(tags),
      questionsJSON: JSON.stringify(questions),
      currentIndex: 0,
      answers: JSON.stringify([])
    }
  });
}

export async function submitQuizAnswer(sessionId: string, questionIndex: number, selectedOption: number) {
  const session = await prisma.quizSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error('Quiz session not found');
  const questions = JSON.parse(session.questionsJSON);
  const answers = JSON.parse(session.answers);
  if (questionIndex >= questions.length) throw new Error('Invalid question index');
  const question = questions[questionIndex];
  const isCorrect = selectedOption === question.correctAnswer;
  answers[questionIndex] = {
    questionId: question.id,
    selectedOption,
    isCorrect,
    answeredAt: new Date().toISOString()
  };
  await prisma.quizSession.update({ where: { id: sessionId }, data: { answers: JSON.stringify(answers) } });
  return {
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    selectedOption
  };
}

export async function nextQuizQuestion(sessionId: string) {
  const session = await prisma.quizSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error('Quiz session not found');
  const questions = JSON.parse(session.questionsJSON);
  const newIndex = Math.min(session.currentIndex + 1, questions.length - 1);
  await prisma.quizSession.update({ where: { id: sessionId }, data: { currentIndex: newIndex } });
  const currentQuestion = newIndex < questions.length ? questions[newIndex] : null;
  return {
    currentQuestion,
    currentIndex: newIndex,
    totalQuestions: questions.length,
    isLastQuestion: newIndex === questions.length - 1
  };
}

export async function prevQuizQuestion(sessionId: string) {
  const session = await prisma.quizSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error('Quiz session not found');
  const questions = JSON.parse(session.questionsJSON);
  const newIndex = Math.max(session.currentIndex - 1, 0);
  await prisma.quizSession.update({ where: { id: sessionId }, data: { currentIndex: newIndex } });
  const currentQuestion = questions[newIndex];
  return {
    currentQuestion,
    currentIndex: newIndex,
    totalQuestions: questions.length,
    isFirstQuestion: newIndex === 0
  };
}

export async function getQuizSessionById(sessionId: string) {
  const session = await prisma.quizSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error('Quiz session not found');
  const questions = JSON.parse(session.questionsJSON);
  const answers = JSON.parse(session.answers);
  const currentQuestion = questions[session.currentIndex];
  return {
    sessionId: session.id,
    createdAt: session.createdAt,
    currentIndex: session.currentIndex,
    totalQuestions: questions.length,
    currentQuestion,
    answers,
    tags: JSON.parse(session.tags),
    fileIds: JSON.parse(session.fileIds)
  };
}
