import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import '../styles/Pages.css'
import '../styles/LeaderboardPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function LeaderboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {}
      
      const response = await axios.get(`${API_URL}/leaderboard?mode=ranked&period=all`, config)
      const { entries, myRank: userRank } = response.data
      setLeaderboard(entries || [])
      setMyRank(userRank)
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
      
      if (err.response?.status === 401) {
        setError('Please login to view the leaderboard. Showing mock data.')
      } else {
        setError('Failed to load leaderboard. Showing mock data.')
      }
      
      setLeaderboard([
        { rank: 1, username: 'Alice Smith', score: 980, avatarUrl: '👩‍🎓' },
        { rank: 2, username: 'Bob Johnson', score: 890, avatarUrl: '👨‍🎓' },
        { rank: 3, username: 'Charlie Davis', score: 820, avatarUrl: '👩‍🔬' },
        { rank: 4, username: 'Diana Evans', score: 750, avatarUrl: '👨‍🏫' },
        { rank: 5, username: 'Ethan Wilson', score: 680, avatarUrl: '👩‍💼' },
        { rank: 6, username: 'Fiona Brown', score: 620, avatarUrl: '👨‍🔬' },
        { rank: 7, username: 'George Taylor', score: 550, avatarUrl: '👩‍🎨' },
        { rank: 8, username: 'Helen Thomas', score: 480, avatarUrl: '👨‍💻' },
        { rank: 9, username: 'Ivan Jackson', score: 420, avatarUrl: '👩‍🔧' },
        { rank: 10, username: 'Julia White', score: 350, avatarUrl: '👨‍🎤' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getUserRank = () => {
    if (!user || !myRank) return null
    return myRank.rank
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
                <div className="user-info">
                  <span className="user-greeting">Welcome, {user.username}</span>
                  <span className="coin-display">
                    💰 {user.coins || 0} Coins
                  </span>
                </div>
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

        {leaderboard.length >= 3 ? (
          <div className="podium">
            <div className="podium-item second-place">
              <div className="podium-avatar">
                {leaderboard[1]?.avatarUrl ? (
                  <img src={`${API_URL}${leaderboard[1].avatarUrl}`} alt={leaderboard[1]?.username || 'Player'} />
                ) : (
                  <span>🥈</span>
                )}
              </div>
              <div className="podium-name">{leaderboard[1]?.username || 'No player'}</div>
              <div className="podium-score">{leaderboard[1]?.score || 0}</div>
              <div className="podium-stand">2nd</div>
            </div>
            <div className="podium-item first-place">
              <div className="podium-avatar">
                {leaderboard[0]?.avatarUrl ? (
                  <img src={`${API_URL}${leaderboard[0].avatarUrl}`} alt={leaderboard[0]?.username || 'Player'} />
                ) : (
                  <span>🥇</span>
                )}
              </div>
              <div className="podium-name">{leaderboard[0]?.username || 'No player'}</div>
              <div className="podium-score">{leaderboard[0]?.score || 0}</div>
              <div className="podium-stand">1st</div>
            </div>
            <div className="podium-item third-place">
              <div className="podium-avatar">
                {leaderboard[2]?.avatarUrl ? (
                  <img src={`${API_URL}${leaderboard[2].avatarUrl}`} alt={leaderboard[2]?.username || 'Player'} />
                ) : (
                  <span>🥉</span>
                )}
              </div>
              <div className="podium-name">{leaderboard[2]?.username || 'No player'}</div>
              <div className="podium-score">{leaderboard[2]?.score || 0}</div>
              <div className="podium-stand">3rd</div>
            </div>
          </div>
        ) : leaderboard.length > 0 && (
          <div className="leaderboard-list">
            {leaderboard.map((userItem, index) => {
              const isCurrentUser = user && user.username === userItem.username
              return (
                <div 
                  key={userItem.userId || index} 
                  className={`leaderboard-item ${isCurrentUser ? 'current-user' : ''}`}
                >
                  <div className="leaderboard-rank">#{userItem.rank || index + 1}</div>
                  <div className="leaderboard-avatar">
                    {userItem.avatarUrl ? (
                      <img src={`${API_URL}${userItem.avatarUrl}`} alt={userItem.username || 'Player'} />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <div className="leaderboard-info">
                    <div className="leaderboard-name">
                      {userItem.username || 'Unknown user'}
                      {isCurrentUser && <span className="current-user-badge">You</span>}
                    </div>
                    <div className="leaderboard-detail">
                      Accuracy: {Math.round((userItem.accuracy || 0) * 100)}%
                    </div>
                  </div>
                  <div className="leaderboard-score">{userItem.score || 0}</div>
                </div>
              )
            })}
          </div>
        )}

        {leaderboard.length >= 3 && (
          <div className="leaderboard-list">
            {leaderboard.slice(3).map((userItem) => {
              const isCurrentUser = user && user.username === userItem.username
              return (
                <div 
                  key={userItem.userId} 
                  className={`leaderboard-item ${isCurrentUser ? 'current-user' : ''}`}
                >
                  <div className="leaderboard-rank">#{userItem.rank}</div>
                  <div className="leaderboard-avatar">
                    {userItem.avatarUrl ? (
                      <img src={`${API_URL}${userItem.avatarUrl}`} alt={userItem.username || 'Player'} />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <div className="leaderboard-info">
                    <div className="leaderboard-name">
                      {userItem.username}
                      {isCurrentUser && <span className="current-user-badge">You</span>}
                    </div>
                    <div className="leaderboard-detail">
                      Accuracy: {Math.round((userItem.accuracy || 0) * 100)}%
                    </div>
                  </div>
                  <div className="leaderboard-score">{userItem.score}</div>
                </div>
              )
            })}
          </div>
        )}

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