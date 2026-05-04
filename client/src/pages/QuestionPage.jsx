import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import '../styles/Pages.css'
import '../styles/QuestionPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const mockQuestions = [
  {
    id: 1,
    question: 'When was the Clock Tower built?',
    options: ['1920', '1926', '1932', '1940'],
    correctAnswer: 1,
    explanation: 'The Clock Tower was completed in 1926.'
  },
  {
    id: 2,
    question: 'What is the Clock Tower officially called?',
    options: ['Clock Tower', 'Old Arts Building', 'Clockhouse', 'Auckland Tower'],
    correctAnswer: 1,
    explanation: 'Officially known as the Old Arts Building.'
  },
  {
    id: 3,
    question: 'How many bells are in the Clock Tower?',
    options: ['3', '5', '8', '10'],
    correctAnswer: 2,
    explanation: 'There are 8 bells in the tower.'
  },
  {
    id: 4,
    question: 'What style of architecture is the Clock Tower?',
    options: ['Modern', 'Gothic', 'Romanesque', 'Art Deco'],
    correctAnswer: 2,
    explanation: 'It features Romanesque architectural style.'
  },
  {
    id: 5,
    question: 'What is the Clock Tower used for today?',
    options: ['Administration', 'Library', 'Lecture halls', 'Museum'],
    correctAnswer: 0,
    explanation: 'It houses university administration offices.'
  },
]

function QuestionPage() {
  const navigate = useNavigate()
  const { buildingId } = useParams()
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(180)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchQuestions()
  }, [buildingId])

  useEffect(() => {
    if (timeLeft > 0 && !showResult && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0) {
      finishQuiz()
    }
  }, [timeLeft, showResult, questions.length])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_URL}/quizzes/${buildingId}/questions`)
      setQuestions(response.data)
    } catch (err) {
      console.error('Failed to fetch questions:', err)
      setError('Failed to load questions. Using demo questions.')
      setQuestions(mockQuestions)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (index) => {
    if (showResult) return
    setSelectedAnswer(index)
    setShowResult(true)
    
    if (index === questions[currentIndex].correctAnswer) {
      setScore(prev => prev + 20)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      finishQuiz()
    }
  }

  const finishQuiz = async () => {
    try {
      await axios.post(`${API_URL}/quizzes/${buildingId}/submit`, {
        score,
        answers: questions.map((q, i) => ({
          questionId: q.id,
          selectedAnswer: i <= currentIndex ? (i === currentIndex ? selectedAnswer : questions[i].userAnswer) : null,
          isCorrect: i <= currentIndex ? (i === currentIndex ? selectedAnswer === q.correctAnswer : questions[i].isCorrect) : false
        }))
      })
    } catch (err) {
      console.error('Failed to submit score:', err)
    }
    navigate(`/quiz/${buildingId}/result?score=${score}&total=${questions.length * 20}`)
  }

  const handleBack = () => {
    navigate(`/quiz/${buildingId}`)
  }

  if (loading) {
    return (
      <div className="page-container">
        <nav className="navbar">
          <div className="navbar-container">
            <h2 className="navbar-logo" onClick={handleBack}>UOA Quiz</h2>
          </div>
        </nav>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading questions...</p>
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
          <h2 className="navbar-logo" onClick={handleBack}>UOA Quiz</h2>
          <div className="navbar-buttons">
            <span className="timer">⏱️ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
          </div>
        </div>
      </nav>

      <main className="question-content">
        {error && (
          <div className="error-message-box">
            ⚠️ {error}
          </div>
        )}

        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">{currentIndex + 1} / {questions.length}</span>
        </div>

        <div className="question-card">
          <div className="question-number">Question {currentIndex + 1}</div>
          <h2 className="question-text">{currentQuestion.question}</h2>
          
          <div className="options-list">
            {currentQuestion.options.map((option, index) => {
              let optionClass = 'option-item'
              if (showResult) {
                if (index === currentQuestion.correctAnswer) {
                  optionClass += ' correct'
                } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
                  optionClass += ' wrong'
                }
              } else if (selectedAnswer === index) {
                optionClass += ' selected'
              }
              
              return (
                <button
                  key={index}
                  className={optionClass}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </button>
              )
            })}
          </div>

          {showResult && (
            <div className={`explanation-box ${selectedAnswer === currentQuestion.correctAnswer ? 'correct' : 'wrong'}`}>
              <p>
                {selectedAnswer === currentQuestion.correctAnswer ? '✅ Correct!' : '❌ Wrong!'}
                {currentQuestion.explanation && (
                  <span className="explanation-text"> {currentQuestion.explanation}</span>
                )}
              </p>
            </div>
          )}

          <div className="question-actions">
            <button className="btn btn-secondary" onClick={handleBack}>
              Quit
            </button>
            {showResult && (
              <button className="btn btn-primary">
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            )}
          </div>
        </div>

        <div className="score-display">
          <span className="score-label">Current Score</span>
          <span className="score-value">{score}</span>
        </div>
      </main>
    </div>
  )
}

export default QuestionPage