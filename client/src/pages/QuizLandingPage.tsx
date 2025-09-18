import { Link } from 'react-router-dom'

function QuizLandingPage() {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Interactive Quiz Platform
        </h1>
        <p className="text-lg text-gray-600">
          Test your knowledge with personalized quizzes generated from your course materials.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="text-primary-600 mb-6">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Test Your Knowledge?</h2>
        <p className="text-gray-600 mb-6">
          Start a new quiz session with questions generated from your uploaded materials.
          Your progress will be saved automatically.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/quiz/take"
            className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Start Quiz
          </Link>
          
          <button
            disabled
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-lg font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
          >
            View Statistics (Coming Soon)
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Instructions</h3>
        <div className="text-left space-y-3">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-xs font-medium text-primary-600">1</span>
            </div>
            <p className="text-gray-600">Questions are multiple-choice with 4-5 options each</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-xs font-medium text-primary-600">2</span>
            </div>
            <p className="text-gray-600">Submit your answer to see if it's correct and view explanations</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-xs font-medium text-primary-600">3</span>
            </div>
            <p className="text-gray-600">Navigate between questions using Previous and Next buttons</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-xs font-medium text-primary-600">4</span>
            </div>
            <p className="text-gray-600">Your progress is automatically saved - you can refresh without losing data</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          Don't have any materials uploaded yet?{' '}
          <Link to="/upload" className="text-primary-600 hover:text-primary-500 font-medium">
            Upload some course materials
          </Link>{' '}
          to get started with personalized quizzes.
        </p>
      </div>
    </div>
  )
}

export default QuizLandingPage