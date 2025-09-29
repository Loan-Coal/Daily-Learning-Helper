import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Library from './pages/Library';
import Quiz from './pages/Quiz';
// TEMPORARILY DISABLED - Calendar functionality will be restored in future update
// import CalendarMap from './pages/CalendarMap';
import Auth from './pages/Auth';
import PrivateRoute from './components/PrivateRoute';

// Placeholder for QuizSessionPage
import React from 'react';
const QuizSessionPage = React.lazy(() => import('./pages/QuizSessionPage'));
const QuizGeneratingPage = React.lazy(() => import('./pages/QuizGeneratingPage'));

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          {/* TEMPORARILY DISABLED - Calendar routes will be restored in future update
          <Route path="/calendar" element={<CalendarMap />} />
          <Route path="/calendar-map" element={<CalendarMap />} />
          */}
          <Route path="/upload" element={
            <PrivateRoute>
              <Upload />
            </PrivateRoute>
          } />
          <Route path="/library" element={
            <PrivateRoute>
              <Library />
            </PrivateRoute>
          } />
          <Route path="/quiz" element={
            <PrivateRoute>
              <Quiz />
            </PrivateRoute>
          } />
          <Route path="/quiz/generating" element={
            <PrivateRoute>
              <React.Suspense fallback={<div className="flex justify-center items-center h-40"><div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full"></div></div>}>
                <QuizGeneratingPage />
              </React.Suspense>
            </PrivateRoute>
          } />
          <Route path="/quiz/session/:sessionId" element={<QuizSessionPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;