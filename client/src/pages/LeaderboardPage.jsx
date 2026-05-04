import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import '../styles/Pages.css'
import '../styles/LeaderboardPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function LeaderboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_URL}/leaderboard`)
      setLeaderboard(response.data)
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
      setError('Failed to load leaderboard. Showing mock data.')
      setLeaderboard([
        { id: 1, name: 'Alice Smith', score: 980, quizzesCompleted: 15, avatar: '👩‍🎓' },
        { id: 2, name: 'Bob Johnson', score: 890, quizzesCompleted: 12, avatar: '👨‍🎓' },
        { id: 3, name: 'Charlie Davis', score: 820, quizzesCompleted: 10, avatar: '👩‍🔬' },
        { id: 4, name: 'Diana Evans', score: 750, quizzesCompleted: 9, avatar: '👨‍🏫' },
        { id: 5, name: 'Ethan Wilson', score: 680, quizzesCompleted: 8, avatar: '👩‍💼' },
        { id: 6, name: 'Fiona Brown', score: 620, quizzesCompleted: 7, avatar: '👨‍🔬' },
        { id: 7, name: 'George Taylor', score: 550, quizzesCompleted: 6, avatar: '👩‍🎨' },
        { id: 8, name: 'Helen Thomas', score: 480, quizzesCompleted: 5, avatar: '👨‍💻' },
        { id: 9, name: 'Ivan Jackson', score: 420, quizzesCompleted: 4, avatar: '👩‍🔧' },
        { id: 10, name: 'Julia White', score: 350, quizzesCompleted: 3, avatar: '👨‍🎤' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getUserRank = () => {
    if (!user) return null
    const rank = leaderboard.findIndex(u => u.email === user.email || u.name === user.name)
    return rank >= 0 ? rank + 1 : null
  }

  const userRank = getUserRank()

  if (loading) {
    return (
      <div className="page-container">
        <nav className="navbar">
          <div className="navbar-container">
            <h2 className="navbar-logo" onClick={() => navigate('/')}>UOA Quiz</h2>
          </div>
        </nav>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <nav className="navbar">
        <div className="navbar-container">
          <h2 className="navbar-logo" onClick={() => navigate('/')}>UOA Quiz</h2>
          <div className="navbar-buttons">
            {user ? (
              <>
                <span className="user-greeting">Welcome, {user.name}</span>
                <button className="btn-nav btn-nav-primary" onClick={() => navigate('/quiz')}>
                  Play Quiz
                </button>
              </>
            ) : (
              <>
                <button className="btn-nav" onClick={() => navigate('/login')}>
                  Login
                </button>
                <button className="btn-nav btn-nav-primary" onClick={() => navigate('/register')}>
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="leaderboard-content">
        {error && (
          <div className="error-message-box">
            ⚠️ {error}
          </div>
        )}

        <div className="leaderboard-header">
          <h1>🏆 Leaderboard</h1>
          <p>Top performers on the UOA Campus Quiz</p>
          {user && userRank && (
            <div className="user-rank-badge">
              Your Rank: #{userRank}
            </div>
          )}
        </div>

        {leaderboard.length >= 3 && (
          <div className="podium">
            <div className="podium-item second-place">
              <div className="podium-avatar">🥈</div>
              <div className="podium-name">{leaderboard[1].name}</div>
              <div className="podium-score">{leaderboard[1].score}</div>
              <div className="podium-stand">2nd</div>
            </div>
            <div className="podium-item first-place">
              <div className="podium-avatar">🥇</div>
              <div className="podium-name">{leaderboard[0].name}</div>
              <div className="podium-score">{leaderboard[0].score}</div>
              <div className="podium-stand">1st</div>
            </div>
            <div className="podium-item third-place">
              <div className="podium-avatar">🥉</div>
              <div className="podium-name">{leaderboard[2].name}</div>
              <div className="podium-score">{leaderboard[2].score}</div>
              <div className="podium-stand">3rd</div>
            </div>
          </div>
        )}

        <div className="leaderboard-list">
          {leaderboard.slice(3).map((userItem, index) => {
            const rank = index + 4
            const isCurrentUser = user && (user.email === userItem.email || user.name === userItem.name)
            return (
              <div 
                key={userItem.id} 
                className={`leaderboard-item ${isCurrentUser ? 'current-user' : ''}`}
              >
                <div className="leaderboard-rank">#{rank}</div>
                <div className="leaderboard-avatar">{userItem.avatar || '👤'}</div>
                <div className="leaderboard-info">
                  <div className="leaderboard-name">
                    {userItem.name}
                    {isCurrentUser && <span className="current-user-badge">You</span>}
                  </div>
                  <div className="leaderboard-detail">
                    {userItem.quizzesCompleted || 0} quizzes completed
                  </div>
                </div>
                <div className="leaderboard-score">{userItem.score}</div>
              </div>
            )
          })}
        </div>

        {leaderboard.length === 0 && (
          <div className="empty-state">
            <p>No players yet. Be the first to play!</p>
          </div>
        )}

        {!user && (
          <div className="leaderboard-cta">
            <p>Login to track your progress and compete with others!</p>
            <div className="leaderboard-buttons">
              <button className="btn btn-secondary" onClick={() => navigate('/login')}>
                Login
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>
                Sign Up
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default LeaderboardPage