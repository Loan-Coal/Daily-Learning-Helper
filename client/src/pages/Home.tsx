import { Link } from 'react-router-dom'

function WelcomePage() {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Danta Agentic Teaching
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Upload your course materials and get personalized daily quizzes to enhance your learning experience.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-primary-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Materials</h3>
          <p className="text-gray-600 mb-4">
            Upload your PDF course materials with custom tags for better organization and retrieval.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Upload Materials
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-primary-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Take Quizzes</h3>
          <p className="text-gray-600 mb-4">
            Generate personalized quizzes from your uploaded materials and track your progress.
          </p>
          <Link
            to="/quiz"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Start Quiz
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-bold">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Upload</h3>
            <p className="text-sm text-gray-600">Upload your PDF course materials with relevant tags</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Process</h3>
            <p className="text-sm text-gray-600">AI analyzes your content and generates relevant questions</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-bold">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Learn</h3>
            <p className="text-sm text-gray-600">Take personalized quizzes and track your progress</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link
          to="/library"
          className="text-primary-600 hover:text-primary-500 font-medium"
        >
          View your uploaded materials →
        </Link>
      </div>
    </div>
  )
}

export default WelcomePage