import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Pages.css'
import '../styles/ResultPage.css'

function ResultPage() {
  const navigate = useNavigate()
  const { buildingId } = useParams()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(100)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const scoreParam = searchParams.get('score')
    const totalParam = searchParams.get('total')
    if (scoreParam) setScore(parseInt(scoreParam))
    if (totalParam) setTotal(parseInt(totalParam))
  }, [searchParams])

  const percentage = Math.round((score / total) * 100)

  const getResultMessage = () => {
    if (percentage >= 90) return { emoji: '🏆', message: 'Excellent!', color: 'gold' }
    if (percentage >= 70) return { emoji: '🎉', message: 'Great job!', color: 'green' }
    if (percentage >= 50) return { emoji: '👍', message: 'Good effort!', color: 'blue' }
    return { emoji: '💪', message: 'Keep practicing!', color: 'orange' }
  }

  const result = getResultMessage()

  const handlePlayAgain = () => {
    navigate(`/quiz/${buildingId}`)
  }

  const handleBackToMap = () => {
    navigate('/quiz')
  }

  const handleLeaderboard = () => {
    navigate('/leaderboard')
  }

  return (
    <div className="result-page">
      <nav className="navbar">
        <div className="navbar-container">
          <h2 className="navbar-logo" onClick={() => navigate('/')}>UOA Quiz</h2>
        </div>
      </nav>

      <main className="result-content">
        <div className="result-card">
          <div className={`result-emoji ${result.color}`}>{result.emoji}</div>
          <h1 className="result-title">{result.message}</h1>
          
          <div className="score-circle">
            <div className="score-inner">
              <span className="score-number">{score}</span>
              <span className="score-total">/ {total}</span>
            </div>
            <svg className="score-ring" viewBox="0 0 100 100">
              <circle
                className="ring-bg"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="8"
              />
              <circle
                className="ring-progress"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={result.color === 'gold' ? '#fbbf24' : result.color === 'green' ? '#22c55e' : result.color === 'blue' ? '#3b82f6' : '#f97316'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 2.83} 283`}
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>

          <div className="result-stats">
            <div className="stat-row">
              <span className="stat-label">Percentage</span>
              <span className="stat-value">{percentage}%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">User</span>
              <span className="stat-value">{user?.username || 'Guest'}</span>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn btn-secondary" onClick={handleBackToMap}>
              Back to Map
            </button>
            <button className="btn btn-primary" onClick={handlePlayAgain}>
              Play Again
            </button>
            <button className="btn btn-outline" onClick={handleLeaderboard}>
              View Leaderboard
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ResultPage