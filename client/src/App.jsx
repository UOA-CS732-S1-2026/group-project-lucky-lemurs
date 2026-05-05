import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'
import QuestionPage from './pages/QuestionPage'
import TestModePage from './pages/TestModePage'
import ResultPage from './pages/ResultPage'
import ReviewPage from './pages/ReviewPage'
import LeaderboardPage from './pages/LeaderboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ErrorPage from './pages/ErrorPage'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            } />
            <Route path="/register" element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            } />
            <Route path="/quiz" element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            } />
            <Route path="/quiz/:buildingId" element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            } />
            <Route path="/quiz/:buildingId/questions" element={
              <ProtectedRoute>
                <QuestionPage />
              </ProtectedRoute>
            } />
            <Route path="/quiz/:buildingId/result" element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            } />
            <Route path="/quiz/:buildingId/review" element={
              <ProtectedRoute>
                <ReviewPage />
              </ProtectedRoute>
            } />
            <Route path="/test-mode/questions" element={
              <ProtectedRoute>
                <TestModePage />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App