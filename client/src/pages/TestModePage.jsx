import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import '../styles/Pages.css'
import '../styles/QuestionPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function TestModePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [sessionId, setSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [currentScore, setCurrentScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [answerResult, setAnswerResult] = useState(null)
  const [isFinished, setIsFinished] = useState(false)
  const [finalResult, setFinalResult] = useState(null)
  const startTimeRef = useRef(Date.now())
  const questionStartTimeRef = useRef(Date.now())

  useEffect(() => {
    if (location.state?.sessionData) {
      const { sessionId: existingSessionId, questions: quizQuestions } = location.state.sessionData
      setSessionId(existingSessionId)
      setQuestions(quizQuestions)
      setLoading(false)
    } else {
      startTestModeSession()
    }
  }, [location.state])

  useEffect(() => {
    if (timeLeft > 0 && !showResult && questions.length > 0 && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && !isFinished) {
      finishTestMode()
    }
  }, [timeLeft, showResult, questions.length, isFinished])

  const startTestModeSession = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.post(`${API_URL}/quiz/ranked/start`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const { sessionId: newSessionId, questions: quizQuestions } = response.data
      setSessionId(newSessionId)
      setQuestions(quizQuestions)
      setTimeLeft(60)
      startTimeRef.current = Date.now()
      questionStartTimeRef.current = Date.now()
    } catch (err) {
      console.error('Failed to start test mode:', err)
      setError('Failed to load test mode. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (optionId) => {
    if (showResult || isFinished) return

    const timeSpentSeconds = Math.round((Date.now() - questionStartTimeRef.current) / 1000)

    try {
      const response = await axios.post(`${API_URL}/quiz/sessions/${sessionId}/answers`, {
        questionId: questions[currentIndex].id,
        selectedOptionId: optionId,
        timeSpentSeconds
      })

      const result = response.data
      setAnswerResult(result)
      setSelectedAnswer(optionId)
      setShowResult(true)
      setCurrentScore(result.currentScore)
      setCorrectCount(result.correctCount)
      setIncorrectCount(result.incorrectCount)
    } catch (err) {
      console.error('Failed to submit answer:', err)
      setError('Failed to submit answer.')
    }
  }

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setAnswerResult(null)
      questionStartTimeRef.current = Date.now()
    } else {
      finishTestMode()
    }
  }

  const finishTestMode = async () => {
    try {
      const response = await axios.post(`${API_URL}/quiz/sessions/${sessionId}/finish`)
      setFinalResult(response.data)
      setIsFinished(true)
    } catch (err) {
      console.error('Failed to finish test mode:', err)
      setError('Failed to finish test mode.')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleBackToMap = () => {
    navigate('/quiz')
  }

  if (loading) {
    return (
      <div className="question-page">
        <nav className="navbar">
          <div className="navbar-container">
            <h2 className="navbar-logo">Test Mode</h2>
            <div className="navbar-buttons">
              <button className="btn-nav" onClick={handleBackToMap}>
                Back to Map
              </button>
            </div>
          </div>
        </nav>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading test mode...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="question-page">
        <nav className="navbar">
          <div className="navbar-container">
            <h2 className="navbar-logo">Test Mode</h2>
            <div className="navbar-buttons">
              <button className="btn-nav" onClick={handleBackToMap}>
                Back to Map
              </button>
            </div>
          </div>
        </nav>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="btn btn-primary" onClick={startTestModeSession}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (isFinished && finalResult) {
    return (
      <div className="question-page">
        <nav className="navbar">
          <div className="navbar-container">
            <h2 className="navbar-logo">Test Mode Complete</h2>
            <div className="navbar-buttons">
              <button className="btn-nav" onClick={handleBackToMap}>
                Back to Map
              </button>
            </div>
          </div>
        </nav>
        <main className="question-content">
          <div className="result-card">
            <h1>Test Mode Results</h1>
            <div className="result-stats">
              <div className="stat-item">
                <span className="stat-value">{finalResult.score}</span>
                <span className="stat-label">Final Score</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{finalResult.correctCount}</span>
                <span className="stat-label">Correct Answers</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{finalResult.incorrectCount}</span>
                <span className="stat-label">Incorrect Answers</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{finalResult.bestStreak}</span>
                <span className="stat-label">Best Streak</span>
              </div>
            </div>
            <div className="result-actions">
              <button className="btn btn-primary" onClick={startTestModeSession}>
                Try Again
              </button>
              <button className="btn btn-secondary" onClick={handleBackToMap}>
                Back to Map
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="question-page">
      <nav className="navbar">
        <div className="navbar-container">
          <h2 className="navbar-logo">Test Mode</h2>
          <div className="navbar-buttons">
            <span className="time-display">{formatTime(timeLeft)}</span>
            <button className="btn-nav" onClick={handleBackToMap}>
              Back to Map
            </button>
          </div>
        </div>
      </nav>

      <main className="question-content">
        <div className="quiz-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>

        <div className="question-card">
          <div className="question-number">Question {currentIndex + 1}</div>
          <h1 className="question-text">{currentQuestion?.questionText}</h1>
          
          <div className="options-list">
            {currentQuestion?.options?.map((option) => (
              <button
                key={option.id}
                className={`option-item ${
                  showResult 
                    ? option.id === answerResult?.correctOptionId 
                      ? 'correct' 
                      : selectedAnswer === option.id 
                        ? 'incorrect' 
                        : ''
                    : selectedAnswer === option.id
                      ? 'selected'
                      : ''
                }`}
                onClick={() => handleAnswer(option.id)}
                disabled={showResult || isFinished}
              >
                <span className="option-radio">
                  {showResult && option.id === answerResult?.correctOptionId && '✓'}
                  {showResult && selectedAnswer === option.id && option.id !== answerResult?.correctOptionId && '✗'}
                  {!showResult && selectedAnswer === option.id && '●'}
                </span>
                <span className="option-text">{option.text}</span>
              </button>
            ))}
          </div>

          {showResult && (
            <div className="answer-feedback">
              <div className={`feedback ${answerResult?.correct ? 'correct' : 'incorrect'}`}>
                <h3>{answerResult?.correct ? 'Correct!' : 'Incorrect!'}</h3>
                <p>{currentQuestion?.explanation}</p>
                <div className="score-update">
                  Score: +{answerResult?.scoreDelta}
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleNext}>
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Test'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default TestModePage