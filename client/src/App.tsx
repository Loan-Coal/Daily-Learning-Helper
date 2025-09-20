import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Library from './pages/Library';
import Quiz from './pages/Quiz';
import CalendarMap from './pages/CalendarMap';
import Auth from './pages/Auth';
import PrivateRoute from './components/PrivateRoute';

// Placeholder for QuizSessionPage
import React from 'react';
const QuizSessionPage = React.lazy(() => import('./pages/QuizSessionPage'));

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/calendar" element={<CalendarMap />} />
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
          <Route path="/quiz/session/:sessionId" element={<QuizSessionPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;