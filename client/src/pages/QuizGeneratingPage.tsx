import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface QuizGenerationStatus {
  sessionId?: string;
  status: 'generating' | 'ready' | 'failed' | 'fallback';
  message?: string;
  progress?: number;
  questionCount?: number;
  tags?: string[];
}

const QuizGeneratingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Get quiz parameters from URL
  const tags = searchParams.get('tags')?.split(',') || [];
  const questionCount = parseInt(searchParams.get('questionCount') || '5');
  const tempId = searchParams.get('tempId') || '';

  const [status, setStatus] = useState<QuizGenerationStatus>({
    status: 'generating',
    message: 'Initializing AI question generation...',
    progress: 0,
    questionCount,
    tags
  });

  const [showFallbackNotice, setShowFallbackNotice] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // Prevent multiple calls
  const [isGenerating, setIsGenerating] = useState(false); // Prevent concurrent calls

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (tags.length === 0 || !questionCount) {
      navigate('/quiz');
      return;
    }

    // Only start once
    if (!hasStarted) {
      setHasStarted(true);
      generateQuestions();
    }
  }, [user, hasStarted]); // Removed tags, questionCount, tempId from dependencies

  const generateQuestions = async () => {
    // Prevent multiple simultaneous calls
    if (isGenerating) {
      console.log('Quiz generation already in progress, skipping...');
      return;
    }

    setIsGenerating(true);
    
    try {
      setStatus(prev => ({
        ...prev,
        status: 'generating',
        message: 'Analyzing your uploaded documents...',
        progress: 20
      }));

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      // Simulate progress updates
      const progressUpdates = [
        { progress: 30, message: 'Searching relevant content...' },
        { progress: 50, message: 'Generating questions with AI...' },
        { progress: 70, message: 'Optimizing question quality...' },
        { progress: 90, message: 'Finalizing quiz session...' }
      ];

      // Show progress updates
      for (let i = 0; i < progressUpdates.length; i++) {
        setTimeout(() => {
          setStatus(prev => ({
            ...prev,
            ...progressUpdates[i]
          }));
        }, i * 1500);
      }

      // Start quiz generation
      const response = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tags,
          questionCount
        })
      });

      const data = await response.json();

      if (data.success) {
        setStatus({
          status: data.data.generationStatus || 'ready',
          sessionId: data.data.sessionId,
          message: data.message || 'Questions generated successfully!',
          progress: 100,
          questionCount: data.data.totalQuestions,
          tags
        });

        // Show fallback notice if using backup questions
        if (data.data.generationStatus === 'fallback') {
          setShowFallbackNotice(true);
          setTimeout(() => setShowFallbackNotice(false), 5000);
        }

        // Redirect to quiz session after a brief delay
        setTimeout(() => {
          navigate(`/quiz/session/${data.data.sessionId}`);
        }, 2000);

      } else {
        setStatus({
          status: 'failed',
          message: data.error?.message || 'Failed to generate questions',
          progress: 0,
          questionCount,
          tags
        });
      }

    } catch (error) {
      console.error('Quiz generation error:', error);
      setStatus({
        status: 'failed',
        message: 'Network error - please check your connection',
        progress: 0,
        questionCount,
        tags
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setHasStarted(false);
    setIsGenerating(false);
    setStatus({
      status: 'generating',
      message: 'Retrying question generation...',
      progress: 0,
      questionCount,
      tags
    });
    setTimeout(() => {
      setHasStarted(true);
      generateQuestions();
    }, 100);
  };

  const handleGoBack = () => {
    navigate('/quiz');
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Generating Your Quiz
          </h1>
          <p className="text-gray-600">
            Creating {questionCount} questions for: {tags.join(', ')}
          </p>
        </div>

        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">{status.message}</span>
            <span className="text-sm text-gray-600">{status.progress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                status.status === 'failed' 
                  ? 'bg-red-500' 
                  : status.status === 'ready'
                    ? 'bg-green-500'
                    : 'bg-blue-500'
              }`}
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>

        {/* Status Icon */}
        <div className="text-center mb-8">
          {status.status === 'generating' && (
            <div className="animate-spin mx-auto w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full" />
          )}
          
          {status.status === 'ready' && (
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {status.status === 'fallback' && (
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          )}
          
          {status.status === 'failed' && (
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          {status.status === 'failed' && (
            <>
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mr-4"
              >
                Try Again
              </button>
              <button
                onClick={handleGoBack}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Go Back
              </button>
            </>
          )}

          {(status.status === 'ready' || status.status === 'fallback') && (
            <p className="text-gray-600">
              Redirecting to your quiz in a moment...
            </p>
          )}
        </div>

        {/* Fallback Notice */}
        {showFallbackNotice && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Using Backup Questions
                </h4>
                <p className="text-sm text-yellow-700">
                  AI question generation is temporarily unavailable. We're using high-quality backup questions for your quiz.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Technical Details (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
            <div><strong>Session ID:</strong> {status.sessionId || tempId}</div>
            <div><strong>Status:</strong> {status.status}</div>
            <div><strong>Tags:</strong> {tags.join(', ')}</div>
            <div><strong>Question Count:</strong> {questionCount}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGeneratingPage;