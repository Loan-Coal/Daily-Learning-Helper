
import prisma from '../prisma/client';
import { getQuestions } from './pythonService';

export interface QuizSessionResult {
  sessionId: string;
  totalQuestions: number;
  currentQuestion: any;
  currentIndex: number;
}

export async function startQuizSession(tags: string[], questionCount: number): Promise<QuizSessionResult> {
  // Fetch file IDs by tag (as before)
  let fileIds: string[] = [];
  if (tags.length > 0) {
    const files = await prisma.file.findMany({
      where: { tags: { contains: tags[0] } },
      select: { id: true }
    });
    fileIds = files.map((f: any) => f.id);
  }

  // Use Python service to generate questions
  let questions;
  try {
    questions = await getQuestions(tags, questionCount);
  } catch (err: any) {
    throw new Error(`Failed to generate quiz questions: ${err.message || err}`);
  }

  const session = await prisma.quizSession.create({
    data: {
      fileIds: JSON.stringify(fileIds),
      tags: JSON.stringify(tags),
      questionsJSON: JSON.stringify(questions),
      currentIndex: 0,
      answers: JSON.stringify([])
    }
  });

  return {
    sessionId: session.id,
    totalQuestions: questions.length,
    currentQuestion: questions[0] || null,
    currentIndex: 0
  };
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
