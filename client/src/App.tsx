import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import WelcomePage from './pages/WelcomePage'
import UploadPage from './pages/UploadPage'
import LibraryPage from './pages/LibraryPage'
import QuizLandingPage from './pages/QuizLandingPage'
import QuizPage from './pages/QuizPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/quiz" element={<QuizLandingPage />} />
        <Route path="/quiz/take" element={<QuizPage />} />
      </Routes>
    </Layout>
  )
}

export default App