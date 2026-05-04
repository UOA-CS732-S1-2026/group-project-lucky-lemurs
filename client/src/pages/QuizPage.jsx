import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import campusImage from '../campus.png'
import '../styles/QuizPage.css'

const buildings = [
  { id: 'clocktower', name: 'Clock Tower', position: { top: '18%', left: '43%' }, difficulty: 'easy' },
  { id: 'oldgov', name: 'Old Government House', position: { top: '32%', left: '20%' }, difficulty: 'medium' },
  { id: 'owenglenn', name: 'Owen G. Glenn Building', position: { top: '22%', left: '68%' }, difficulty: 'hard' },
  { id: 'business', name: 'Business School', position: { top: '35%', left: '82%' }, difficulty: 'hard' },
  { id: 'library', name: 'General Library', position: { top: '55%', left: '18%' }, difficulty: 'medium' },
  { id: 'humanities', name: 'Humanities Building', position: { top: '78%', left: '27%' }, difficulty: 'easy' },
  { id: 'science', name: 'Science Centre', position: { top: '75%', left: '50%' }, difficulty: 'hard' },
  { id: 'engineering', name: 'Engineering Building', position: { top: '60%', left: '88%' }, difficulty: 'medium' },
]

const difficultyColors = {
  easy: { border: '#22c55e' },
  medium: { border: '#eab308' },
  hard: { border: '#ef4444' },
}

const difficultyLabels = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

function QuizPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { buildingId } = useParams()
  const [clickedBuilding, setClickedBuilding] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setIsTransitioning(false)
    setClickedBuilding(null)
  }, [buildingId])

  const handleBuildingClick = (building) => {
    setClickedBuilding(building.id)
    setIsTransitioning(true)
    
    setTimeout(() => {
      navigate(`/quiz/${building.id}`)
    }, 500)
  }

  const handleBack = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      if (buildingId) {
        navigate('/quiz')
      } else {
        navigate('/')
      }
    }, 300)
  }

  const selectedBuilding = buildings.find(b => b.id === buildingId)

  if (selectedBuilding) {
    return (
      <div className={`quiz-detail-page ${isTransitioning ? 'page-exit' : ''}`}>
        <nav className="navbar">
          <div className="navbar-container">
            <h2 className="navbar-logo" onClick={handleBack}>UOA Quiz</h2>
            <div className="navbar-buttons">
              <button className="btn-nav" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </nav>

        <main className="quiz-detail-content">
          <div className="quiz-card animate-fade-in">
            <div className="quiz-header">
              <h1>{selectedBuilding.name}</h1>
              <span className={`difficulty-badge ${selectedBuilding.difficulty}`}>
                {difficultyLabels[selectedBuilding.difficulty]}
              </span>
            </div>
            <p className="quiz-description">
              Test your knowledge about the {selectedBuilding.name}!
            </p>
            <div className="quiz-stats">
              <div className="stat-item">
                <span className="stat-value">10</span>
                <span className="stat-label">Questions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">3:00</span>
                <span className="stat-label">Time Limit</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">100</span>
                <span className="stat-label">Points</span>
              </div>
            </div>
            <div className="dual-button">
              <button className="btn-half review" onClick={() => navigate(`/quiz/${selectedBuilding.id}/review`)}>
                Review
              </button>
              <button className="btn-half start" onClick={() => navigate(`/quiz/${selectedBuilding.id}/questions`)}>
                Start Quiz
              </button>
            </div>
            <button className="btn btn-secondary" onClick={handleBack}>
              Back to Map
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={`quiz-map-page ${isTransitioning ? 'page-exit' : ''}`}>
      <nav className="navbar">
        <div className="navbar-container">
          <h2 className="navbar-logo" onClick={() => navigate('/')}>UOA Quiz</h2>
          <div className="navbar-buttons">
            <span className="user-greeting">Welcome, {user?.name}</span>
            <button className="btn-nav" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="map-container">
        <div className="map-header animate-fade-in">
          <h1>Explore UOA Campus</h1>
          <p>Click on a building to start a quiz about it!</p>
        </div>

        <div className="map-wrapper">
          <img
            src={campusImage}
            alt="UOA City Campus Map"
            className="campus-map"
          />

          <div className="building-markers">
            {buildings.map((building) => (
              <button
                key={building.id}
                className={`building-marker ${clickedBuilding === building.id ? 'building-clicked' : ''}`}
                style={{
                  top: building.position.top,
                  left: building.position.left,
                  borderColor: difficultyColors[building.difficulty].border,
                }}
                onClick={() => handleBuildingClick(building)}
                title={`${building.name} - ${difficultyLabels[building.difficulty]}`}
              >
                <span className="marker-pulse"></span>
                <span className="marker-icon">🏛️</span>
                <span className="marker-label">{building.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="legend animate-fade-in">
          <h3>Legend</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color easy"></span>
              <span className="legend-text">Easy</span>
            </div>
            <div className="legend-item">
              <span className="legend-color medium"></span>
              <span className="legend-text">Medium</span>
            </div>
            <div className="legend-item">
              <span className="legend-color hard"></span>
              <span className="legend-text">Hard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizPage