import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStartQuiz, useSubmitAnswer, useNextQuestion, usePreviousQuestion } from '../hooks/useApi'
import { QuizQuestion } from '../types'

interface QuizState {
  sessionId: string | null
  currentQuestion: QuizQuestion | null
  currentIndex: number
  totalQuestions: number
  selectedOption: number | null
  hasSubmitted: boolean
  showResult: boolean
  isCorrect: boolean
  explanation: string
  isLastQuestion: boolean
  isFirstQuestion: boolean
}

function QuizPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [quizState, setQuizState] = useState<QuizState>({
    sessionId: null,
    currentQuestion: null,
    currentIndex: 0,
    totalQuestions: 0,
    selectedOption: null,
    hasSubmitted: false,
    showResult: false,
    isCorrect: false,
    explanation: '',
    isLastQuestion: false,
    isFirstQuestion: true
  })
  const [error, setError] = useState<string | null>(null)
  const startQuizMutation = useStartQuiz()
  const submitAnswerMutation = useSubmitAnswer()
  const nextQuestionMutation = useNextQuestion()
  const previousQuestionMutation = usePreviousQuestion()

  // Initialize quiz on component mount
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
        const questionCount = parseInt(searchParams.get('questionCount') || '10')

        const result = await startQuizMutation.mutateAsync({
          tags,
          questionCount
        })

        setQuizState(prev => ({
          ...prev,
          sessionId: result.sessionId,
          currentQuestion: result.currentQuestion,
          currentIndex: result.currentIndex,
          totalQuestions: result.totalQuestions,
          isFirstQuestion: result.currentIndex === 0,
          isLastQuestion: result.currentIndex === result.totalQuestions - 1
        }))
      } catch (error) {
        console.error('Failed to start quiz:', error)
        setError(error instanceof Error ? error.message : 'Failed to start quiz')
      }
    }

    initializeQuiz()
  }, [searchParams])

  const handleOptionSelect = (optionIndex: number) => {
    if (!quizState.hasSubmitted) {
      setQuizState(prev => ({ ...prev, selectedOption: optionIndex }))
    }
  }

  const handleSubmit = async () => {
    if (quizState.selectedOption === null || !quizState.sessionId || !quizState.currentQuestion) {
      return
    }

    try {
      const result = await submitAnswerMutation.mutateAsync({
        sessionId: quizState.sessionId,
        questionIndex: quizState.currentIndex,
        selectedOption: quizState.selectedOption
      })

      setQuizState(prev => ({
        ...prev,
        hasSubmitted: true,
        showResult: true,
        isCorrect: result.isCorrect,
        explanation: result.explanation
      }))
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }
  }

  const handleNext = async () => {
    if (!quizState.sessionId) return

    try {
      const result = await nextQuestionMutation.mutateAsync(quizState.sessionId)

      setQuizState(prev => ({
        ...prev,
        currentQuestion: result.currentQuestion,
        currentIndex: result.currentIndex,
        selectedOption: null,
        hasSubmitted: false,
        showResult: false,
        isCorrect: false,
        explanation: '',
        isLastQuestion: result.isLastQuestion,
        isFirstQuestion: result.currentIndex === 0
      }))
    } catch (error) {
      console.error('Failed to go to next question:', error)
    }
  }

  const handlePrevious = async () => {
    if (!quizState.sessionId) return

    try {
      const result = await previousQuestionMutation.mutateAsync(quizState.sessionId)

      setQuizState(prev => ({
        ...prev,
        currentQuestion: result.currentQuestion,
        currentIndex: result.currentIndex,
        selectedOption: null,
        hasSubmitted: false,
        showResult: false,
        isCorrect: false,
        explanation: '',
        isFirstQuestion: result.isFirstQuestion,
        isLastQuestion: result.currentIndex === result.totalQuestions - 1
      }))
    } catch (error) {
      console.error('Failed to go to previous question:', error)
    }
  }

  const isLoading = startQuizMutation.isPending ||
    submitAnswerMutation.isPending ||
    nextQuestionMutation.isPending ||
    previousQuestionMutation.isPending

  if (startQuizMutation.isPending) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Starting your quiz...</p>
      </div>
    )
  }

  if (!quizState.currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-red-600">Failed to load quiz. Please try again.</p>
        <button
          onClick={() => navigate('/quiz')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Back to Quiz
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {quizState.currentIndex + 1} of {quizState.totalQuestions}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((quizState.currentIndex + 1) / quizState.totalQuestions) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((quizState.currentIndex + 1) / quizState.totalQuestions) * 100}%`
            }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {quizState.currentQuestion.question}
        </h2>

        <div className="space-y-3">
          {quizState.currentQuestion.options.map((option, index) => {
            let optionClass = "block w-full p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"

            if (quizState.selectedOption === index) {
              if (quizState.showResult) {
                if (index === quizState.currentQuestion!.correctAnswer) {
                  optionClass = "block w-full p-4 text-left border-2 border-green-500 bg-green-50 text-green-900 rounded-lg"
                } else {
                  optionClass = "block w-full p-4 text-left border-2 border-red-500 bg-red-50 text-red-900 rounded-lg"
                }
              } else {
                optionClass = "block w-full p-4 text-left border-2 border-primary-500 bg-primary-50 text-primary-900 rounded-lg"
              }
            } else if (quizState.showResult && index === quizState.currentQuestion!.correctAnswer) {
              optionClass = "block w-full p-4 text-left border-2 border-green-500 bg-green-50 text-green-900 rounded-lg"
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={quizState.hasSubmitted || isLoading}
                className={optionClass}
              >
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            )
          })}
        </div>

        {/* Result Display */}
        {quizState.showResult && (
          <div className={`mt-6 p-4 rounded-lg ${quizState.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
            <div className="flex items-center mb-2">
              {quizState.isCorrect ? (
                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className={`font-medium ${quizState.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {quizState.isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <p className={quizState.isCorrect ? 'text-green-700' : 'text-red-700'}>
              {quizState.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={quizState.isFirstQuestion || isLoading}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex gap-3">
          {!quizState.hasSubmitted && (
            <button
              onClick={handleSubmit}
              disabled={quizState.selectedOption === null || isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitAnswerMutation.isPending ? 'Submitting...' : 'Submit'}
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={!quizState.hasSubmitted || quizState.isLastQuestion || isLoading}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {quizState.isLastQuestion ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>

      {/* Quiz completion message */}
      {quizState.isLastQuestion && quizState.hasSubmitted && (
        <div className="mt-8 text-center bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Quiz Complete!</h3>
          <p className="text-blue-700 mb-4">
            You've finished all questions in this quiz session.
          </p>
          <button
            onClick={() => navigate('/quiz')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Start New Quiz
          </button>
        </div>
      )}
    </div>
  )
}

export default QuizPage