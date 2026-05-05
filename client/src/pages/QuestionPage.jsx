import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import '../styles/Pages.css'
import '../styles/QuestionPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function QuestionPage() {
  const navigate = useNavigate()
  const { buildingId } = useParams()
  const { user } = useAuth()
  const [sessionId, setSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [currentScore, setCurrentScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(180)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [answerResult, setAnswerResult] = useState(null)
  const [isFinished, setIsFinished] = useState(false)
  const [finalResult, setFinalResult] = useState(null)
  const startTimeRef = useRef(Date.now())
  const questionStartTimeRef = useRef(Date.now())

  useEffect(() => {
    startQuizSession()
  }, [buildingId])

  useEffect(() => {
    if (timeLeft > 0 && !showResult && questions.length > 0 && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && !isFinished) {
      finishQuiz()
    }
  }, [timeLeft, showResult, questions.length, isFinished])

  const startQuizSession = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.post(`${API_URL}/quiz/building/start`, { buildingId })
      const { sessionId: newSessionId, questions: quizQuestions } = response.data
      setSessionId(newSessionId)
      setQuestions(quizQuestions)
      setTimeLeft(180)
      startTimeRef.current = Date.now()
      questionStartTimeRef.current = Date.now()
    } catch (err) {
      console.error('Failed to start quiz:', err)
      setError('Failed to load quiz. Please try again.')
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
      finishQuiz()
    }
  }

  const finishQuiz = async () => {
    if (isFinished) return
    setIsFinished(true)

    try {
      const response = await axios.post(`${API_URL}/quiz/sessions/${sessionId}/finish`, {})
      setFinalResult(response.data)
    } catch (err) {
      console.error('Failed to finish quiz:', err)
      const timeUsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000)
      setFinalResult({
        sessionId,
        mode: 'building',
        buildingId,
        score: currentScore,
        correctCount,
        incorrectCount,
        totalQuestions: questions.length,
        accuracy: questions.length > 0 ? correctCount / questions.length : 0,
        timeUsedSeconds,
        rank: null,
        buildingProgress: {
          buildingId,
          isCompleted: true,
          bestScore: currentScore
        }
      })
    }

    navigate(`/quiz/${buildingId}/result`, {
      state: {
        score: currentScore,
        totalQuestions: questions.length,
        correctCount,
        incorrectCount
      }
    })
  }

  const handleQuit = () => {
    if (sessionId && !isFinished) {
      finishQuiz()
    } else {
      navigate(`/quiz/${buildingId}`)
    }
  }

  if (loading) {
    return (
      <div className="question-page">
        <nav className="navbar">
          <div className="navbar-container">
            <div className="navbar-left">
              <button className="navbar-back-btn" onClick={handleQuit}>← Back</button>
              <span className="navbar-divider">|</span>
              <button className="navbar-home-btn" onClick={() => navigate('/')}>🏠 Home</button>
            </div>
          </div>
        </nav>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error || questions.length === 0) {
    return (
      <div className="question-page">
        <nav className="navbar">
          <div className="navbar-container">
            <div className="navbar-left">
              <button className="navbar-back-btn" onClick={() => navigate(`/quiz/${buildingId}`)}>← Back</button>
              <span className="navbar-divider">|</span>
              <button className="navbar-home-btn" onClick={() => navigate('/')}>🏠 Home</button>
            </div>
          </div>
        </nav>
        <div className="loading-container">
          <p>{error || 'No questions available.'}</p>
          <button className="btn btn-primary" onClick={() => navigate(`/quiz/${buildingId}`)}>
            Back to Building
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="question-page">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <button className="navbar-back-btn" onClick={handleQuit}>← Back</button>
            <span className="navbar-divider">|</span>
            <button className="navbar-home-btn" onClick={() => navigate('/')}>🏠 Home</button>
          </div>
          <div className="navbar-buttons">
            <span className="timer">⏱️ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
          </div>
        </div>
      </nav>

      <main className="question-content">
        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">{currentIndex + 1} / {questions.length}</span>
        </div>

        <div className="question-card">
          <div className="question-number">
            <span className={`difficulty-badge ${currentQuestion.difficulty}`}>
              {currentQuestion.difficulty?.toUpperCase() || 'BUILDING'}
            </span>
          </div>
          <h2 className="question-text">{currentQuestion.questionText}</h2>

          {currentQuestion.imageUrl && (
            <img 
              src={currentQuestion.imageUrl} 
              alt="Question visual" 
              className="question-image"
            />
          )}
          
          <div className="options-list">
            {currentQuestion.options.map((option) => {
              let optionClass = 'option-item'
              if (showResult && answerResult) {
                if (option.id === answerResult.correctOptionId) {
                  optionClass += ' correct'
                } else if (option.id === selectedAnswer && option.id !== answerResult.correctOptionId) {
                  optionClass += ' wrong'
                }
              } else if (selectedAnswer === option.id) {
                optionClass += ' selected'
              }
              
              return (
                <button
                  key={option.id}
                  className={optionClass}
                  onClick={() => handleAnswer(option.id)}
                  disabled={showResult}
                >
                  <span className="option-letter">{option.id}</span>
                  <span className="option-text">{option.text}</span>
                </button>
              )
            })}
          </div>

          {showResult && answerResult && (
            <div className={`explanation-box ${answerResult.correct ? 'correct' : 'wrong'}`}>
              <p>
                {answerResult.correct ? '✅ Correct!' : '❌ Wrong!'}
                {answerResult.explanation && (
                  <span className="explanation-text"> {answerResult.explanation}</span>
                )}
              </p>
              {answerResult.retryLater && (
                <p className="retry-warning">⚠️ This question will appear again later!</p>
              )}
            </div>
          )}

          <div className="question-actions">
            <button className="btn btn-secondary" onClick={handleQuit}>
              Quit
            </button>
            {showResult && (
              <button className="btn btn-primary" onClick={handleNext}>
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            )}
          </div>
        </div>

        <div className="score-display">
          <span className="score-label">Score</span>
          <span className="score-value">{currentScore}</span>
          <span className="score-detail">
            ✓ {correctCount} | ✗ {incorrectCount}
          </span>
        </div>
      </main>
    </div>
  )
}

export default QuestionPage