import { useNavigate } from 'react-router-dom'
import '../styles/HomePage.css'

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <h2 className="navbar-logo">UOA Quiz</h2>
          <div className="navbar-buttons">
            <button className="btn-nav" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="btn-nav btn-nav-primary" onClick={() => navigate('/register')}>
              Sign Up
            </button>
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
            <button className="btn btn-primary" onClick={() => navigate('/quiz')}>
              Start Quiz
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/leaderboard')}>
              View Leaderboard
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
