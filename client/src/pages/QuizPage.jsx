import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import campusImage from '../campus.png'
import '../styles/QuizPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const buildingPositions = [
  { id: 'clocktower', position: { top: '18%', left: '43%' }, difficulty: 'easy' },
  { id: 'oldgov', position: { top: '32%', left: '20%' }, difficulty: 'medium' },
  { id: 'oggb', position: { top: '22%', left: '68%' }, difficulty: 'hard' },
  { id: 'business', position: { top: '35%', left: '82%' }, difficulty: 'hard' },
  { id: 'library', position: { top: '55%', left: '18%' }, difficulty: 'medium' },
  { id: 'humanities', position: { top: '78%', left: '27%' }, difficulty: 'easy' },
  { id: 'science', position: { top: '75%', left: '50%' }, difficulty: 'hard' },
  { id: 'engineering', position: { top: '60%', left: '88%' }, difficulty: 'medium' },
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
  const [buildings, setBuildings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsTransitioning(false)
    setClickedBuilding(null)
  }, [buildingId])

  useEffect(() => {
    fetchBuildings()
  }, [])

  const fetchBuildings = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/buildings`)
      const backendBuildings = response.data
      
      const mergedBuildings = backendBuildings.map(backend => {
        const positionData = buildingPositions.find(p => p.id === backend.id) || buildingPositions[0]
        return {
          ...backend,
          position: positionData.position,
          difficulty: positionData.difficulty
        }
      })
      
      setBuildings(mergedBuildings)
    } catch (err) {
      console.error('Failed to fetch buildings:', err)
      setBuildings(buildingPositions.map(p => ({
        id: p.id,
        name: p.id.charAt(0).toUpperCase() + p.id.slice(1),
        position: p.position,
        difficulty: p.difficulty
      })))
    } finally {
      setLoading(false)
    }
  }

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
              {selectedBuilding.shortDescription || `Test your knowledge about the ${selectedBuilding.name}!`}
            </p>
            {selectedBuilding.imageUrl && (
              <img 
                src={selectedBuilding.imageUrl} 
                alt={selectedBuilding.name}
                className="quiz-detail-image"
              />
            )}
            <div className="quiz-stats">
              <div className="stat-item">
                <span className="stat-value">{selectedBuilding.questionCount || 10}</span>
                <span className="stat-label">Questions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">3:00</span>
                <span className="stat-label">Time Limit</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{selectedBuilding.averageScore || '--'}</span>
                <span className="stat-label">Avg Score</span>
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
            <span className="user-greeting">Welcome, {user?.username}</span>
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

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading buildings...</p>
          </div>
        )}

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
                  borderColor: difficultyColors[building.difficulty]?.border || '#666',
                }}
                onClick={() => handleBuildingClick(building)}
                title={`${building.name} - ${difficultyLabels[building.difficulty] || 'Medium'}`}
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