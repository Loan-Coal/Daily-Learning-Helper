export interface File {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  tags: string[];
  uploadedAt: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizSession {
  sessionId: string;
  createdAt: string;
  currentIndex: number;
  totalQuestions: number;
  currentQuestion: QuizQuestion | null;
  answers: QuizAnswer[];
  tags: string[];
  fileIds: string[];
}

export interface QuizAnswer {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
  answeredAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface UploadResponse {
  id: string;
  originalName: string;
  size: number;
  tags: string[];
  uploadedAt: string;
  textLength: number;
}