
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuizSession, submitAnswer, nextQuestion, previousQuestion } from '../api/quiz';
import { QuizSession, QuizQuestion } from '../types';

const QuizSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<null | { isCorrect: boolean; correctAnswer: number; explanation: string; selectedOption: number }>(null);
  const [submitting, setSubmitting] = useState(false);
  const [navLoading, setNavLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    getQuizSession(sessionId)
      .then((data) => {
        setSession(data);
        setSelectedOption(null);
        setAnswerResult(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleOptionSelect = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleSubmit = async () => {
    if (!sessionId || selectedOption === null || !session) return;
    setSubmitting(true);
    try {
      const res = await submitAnswer({
        sessionId,
        questionIndex: session.currentIndex,
        selectedOption,
      });
      setAnswerResult(res);
      // Optionally update session state here if backend returns updated session
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!sessionId) return;
    setNavLoading(true);
    try {
      const res = await nextQuestion(sessionId);
      setSession((prev) => prev ? { ...prev, ...res } : null);
      setSelectedOption(null);
      setAnswerResult(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setNavLoading(false);
    }
  };

  const handlePrev = async () => {
    if (!sessionId) return;
    setNavLoading(true);
    try {
      const res = await previousQuestion(sessionId);
      setSession((prev) => prev ? { ...prev, ...res } : null);
      setSelectedOption(null);
      setAnswerResult(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setNavLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading quiz session...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!session || !session.currentQuestion) return <div className="text-center py-8">No active question.</div>;

  const { currentQuestion, currentIndex, totalQuestions } = session;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Quiz Session</h1>
      <div className="mb-2 text-sm text-gray-500">Question {currentIndex + 1} of {totalQuestions}</div>
      <div className="mb-4 font-medium text-lg">{currentQuestion.question}</div>
      <div className="space-y-2 mb-4">
        {currentQuestion.options.map((opt: string, idx: number) => (
          <button
            key={idx}
            className={`block w-full text-left px-4 py-2 rounded border transition-colors ${selectedOption === idx ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 border-gray-200'} ${answerResult && answerResult.correctAnswer === idx ? (answerResult.isCorrect && answerResult.selectedOption === idx ? 'border-green-500 bg-green-100' : 'border-green-400 bg-green-50') : ''}`}
            disabled={!!answerResult}
            onClick={() => handleOptionSelect(idx)}
          >
            {opt}
          </button>
        ))}
      </div>
      {!answerResult && (
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
          disabled={selectedOption === null || submitting}
          onClick={handleSubmit}
        >
          Submit Answer
        </button>
      )}
      {answerResult && (
        <div className="mt-4 p-3 rounded border bg-gray-50">
          <div className={answerResult.isCorrect ? 'text-green-700' : 'text-red-700'}>
            {answerResult.isCorrect ? 'Correct!' : 'Incorrect.'}
          </div>
          <div className="text-sm mt-2">{answerResult.explanation}</div>
        </div>
      )}
      <div className="flex justify-between mt-6">
        <button
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          onClick={handlePrev}
          disabled={currentIndex === 0 || navLoading}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          onClick={handleNext}
          disabled={currentIndex === totalQuestions - 1 || navLoading}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default QuizSessionPage;
