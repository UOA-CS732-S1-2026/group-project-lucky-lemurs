import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import campusImage from '../campus.png'
import '../styles/QuizPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const buildingPositions = [
  { id: 'oggb', position: { top: '22%', left: '68%' }, difficulty: 'hard' },
  { id: 'clocktower', position: { top: '18%', left: '43%' }, difficulty: 'easy' },
  { id: 'kate-edger', position: { top: '32%', left: '20%' }, difficulty: 'medium' },
  { id: 'general-library', position: { top: '55%', left: '18%' }, difficulty: 'medium' },
  { id: 'engineering', position: { top: '60%', left: '88%' }, difficulty: 'hard' },
  { id: 'law-school', position: { top: '35%', left: '82%' }, difficulty: 'medium' },
  { id: 'arts-education', position: { top: '78%', left: '27%' }, difficulty: 'easy' },
  { id: 'science', position: { top: '75%', left: '50%' }, difficulty: 'hard' },
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
  const [startingTestMode, setStartingTestMode] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

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

      const userResponse = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      setUserInfo(userResponse.data)

      const buildingsResponse = await axios.get(`${API_URL}/buildings`)
      const backendBuildings = buildingsResponse.data.buildings || []

      const mergedBuildings = backendBuildings.map((backend) => {
        const positionData = buildingPositions.find((p) => p.id === backend.id) || buildingPositions[0]

        return {
          ...backend,
          position: positionData.position,
          difficulty: positionData.difficulty,
          isUnlocked: Boolean(backend.isUnlocked),
        }
      })

      setBuildings(mergedBuildings)
    } catch (err) {
      console.error('Failed to fetch buildings:', err)
      setBuildings(buildingPositions.map((p) => ({
        id: p.id,
        name: p.id.charAt(0).toUpperCase() + p.id.slice(1),
        position: p.position,
        difficulty: p.difficulty,
        isUnlocked: false,
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

  const handleStartTestMode = async () => {
    try {
      setStartingTestMode(true)
      setIsTransitioning(true)

      const response = await axios.post(`${API_URL}/quiz/ranked/start`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      setTimeout(() => {
        navigate('/test-mode/questions', { state: { sessionData: response.data } })
      }, 500)
    } catch (err) {
      console.error('Failed to start test mode:', err)
      setStartingTestMode(false)
      setIsTransitioning(false)
      alert('Failed to start test mode. Please try again.')
    }
  }

  const calculateUnlockCost = (building) => {
    if (!userInfo || !building) return 0
    const completedCount = userInfo.completedBuildingCount || 0
    const unlockOrder = building.unlockOrder || 1
    return Math.max(0, unlockOrder - completedCount) * 22
  }

  const canUnlockWithCoins = (building) => {
    if (!userInfo || !building) return false
    return !building.isUnlocked
  }

  const hasEnoughCoins = (building) => {
    if (!userInfo || !building) return false
    const cost = calculateUnlockCost(building)
    const userCoins = userInfo.coins || 0
    return userCoins >= cost
  }

  const handleUnlockWithCoins = async (building) => {
    if (!canUnlockWithCoins(building)) return

    try {
      const cost = calculateUnlockCost(building)
      const response = await axios.post(`${API_URL}/buildings/${building.id}/unlock`, {
        cost,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      setBuildings((currentBuildings) => currentBuildings.map((b) => (
        b.id === building.id ? { ...b, isUnlocked: true } : b
      )))

      if (userInfo) {
        setUserInfo({
          ...userInfo,
          coins: response.data.remainingCoins ?? (userInfo.coins || 0) - cost,
        })
      }

      alert(`Successfully unlocked ${building.name} for ${cost} coins!`)
    } catch (err) {
      console.error('Failed to unlock building:', err)
      alert('Failed to unlock building. Please try again.')
    }
  }

  const selectedBuilding = buildings.find((b) => b.id === buildingId)

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
              {selectedBuilding.isUnlocked ? (
                <button
                  className="btn-half start"
                  onClick={() => navigate(`/quiz/${selectedBuilding.id}/questions`)}
                >
                  Start Quiz
                </button>
              ) : (
                <button
                  className="btn-half unlock"
                  onClick={() => handleUnlockWithCoins(selectedBuilding)}
                  disabled={!hasEnoughCoins(selectedBuilding)}
                >
                  Unlock for {calculateUnlockCost(selectedBuilding)} coins
                  <span className="lock-icon-small">🔒</span>
                </button>
              )}
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
            <div className="user-info">
              <span className="user-greeting">Welcome, {user?.username}</span>
              {userInfo && (
                <span className="coin-display">
                  {userInfo.coins || 0} Coins
                </span>
              )}
            </div>
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
            {buildings.map((building) => {
              const isUnlocked = Boolean(building.isUnlocked)

              return (
                <button
                  key={building.id}
                  className={`building-marker ${clickedBuilding === building.id ? 'building-clicked' : ''} ${!isUnlocked ? 'building-locked' : ''}`}
                  style={{
                    top: building.position.top,
                    left: building.position.left,
                    borderColor: difficultyColors[building.difficulty]?.border || '#666',
                  }}
                  onClick={() => handleBuildingClick(building)}
                  title={isUnlocked
                    ? `${building.name} - ${difficultyLabels[building.difficulty] || 'Medium'}`
                    : 'Locked - Complete previous buildings to unlock (Review available)'}
                >
                  <span className="marker-pulse"></span>
                  <span className="marker-icon">🏛️</span>
                  <span className="marker-label">{building.name}</span>
                  {!isUnlocked && <span className="lock-icon">🔒</span>}
                  <span className="unlock-order">{building.unlockOrder}</span>
                </button>
              )
            })}

            <button
              className={`building-marker test-mode-marker ${startingTestMode ? 'building-clicked' : ''}`}
              style={{
                top: '6%',
                left: '65%',
                borderColor: '#000000ff',
              }}
              onClick={handleStartTestMode}
              disabled={startingTestMode}
              title="Timed Test Mode - 20 questions in 60 seconds"
            >
              <span className="marker-pulse"></span>
              <span className="marker-icon">⏱️</span>
              <span className="marker-label">Test Mode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizPage
