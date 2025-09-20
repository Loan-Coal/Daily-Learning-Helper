import axios from 'axios';
import { ApiResponse, QuizSession } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const startQuiz = async (params: {
  tags?: string[];
  questionCount?: number;
}): Promise<QuizSession> => {
  const response = await api.post<ApiResponse<QuizSession>>('/quiz/start', params);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to start quiz');
  }
  return response.data.data as QuizSession;
};

export const submitAnswer = async (params: {
  sessionId: string;
  questionIndex: number;
  selectedOption: number;
}): Promise<{
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string;
  selectedOption: number;
}> => {
  const response = await api.post<ApiResponse>('/quiz/answer', params);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to submit answer');
  }
  return response.data.data;
};

export const nextQuestion = async (sessionId: string): Promise<{
  currentQuestion: any;
  currentIndex: number;
  totalQuestions: number;
  isLastQuestion: boolean;
}> => {
  const response = await api.post<ApiResponse>('/quiz/next', { sessionId });
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to navigate to next question');
  }
  return response.data.data;
};

export const previousQuestion = async (sessionId: string): Promise<{
  currentQuestion: any;
  currentIndex: number;
  totalQuestions: number;
  isFirstQuestion: boolean;
}> => {
  const response = await api.post<ApiResponse>('/quiz/prev', { sessionId });
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to navigate to previous question');
  }
  return response.data.data;
};

export const getQuizSession = async (sessionId: string): Promise<QuizSession> => {
  const response = await api.get<ApiResponse<QuizSession>>(`/quiz/${sessionId}`);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch quiz session');
  }
  return response.data.data as QuizSession;
};
