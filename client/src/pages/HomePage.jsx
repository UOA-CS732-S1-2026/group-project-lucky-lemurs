import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleStartQuiz = () => {
    if (user) {
      navigate('/quiz')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="home-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <h2 className="navbar-logo">UOA Quiz</h2>
          <div className="navbar-buttons">
            {user ? (
              <>
                <div className="user-info">
                  <span className="user-greeting">Welcome, {user.username}</span>
                  <span className="coin-display">
                    💰 {user.coins || 0} Coins
                  </span>
                </div>
                <button className="btn-nav" onClick={logout}>
                  Logout
                </button>
                <button className="btn-nav btn-nav-primary" onClick={() => navigate('/quiz')}>
                  Play Quiz
                </button>
                <button className="btn-nav" onClick={() => navigate('/achievements')}>
                  Achievements
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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Explore UOA Through Quizzes</h1>
          <p className="hero-subtitle">
            Learn about campus history, buildings, facilities, and student life through interactive quizzes. Challenge yourself and discover the University of Auckland like never before.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={handleStartQuiz}>
              {user ? 'Start Quiz' : 'Login to Start'}
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/leaderboard')}>
              View Leaderboard
            </button>
            {user && (
              <button className="btn btn-secondary" onClick={() => navigate('/achievements')}>
                View Achievements
              </button>
            )}
          </div>
          
          {/* {user && (
            <div className="user-stats">
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Quizzes Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Total Score</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">--</span>
                <span className="stat-label">Current Rank</span>
              </div>
            </div>
          )} */}
        </div>
      </section>
    </div>
  )
}

export default HomePage
