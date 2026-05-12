import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import '../styles/AchievementsPage.css'

function AchievementsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [buildings, setBuildings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBuildings = useCallback(async () => {
    try {
      const response = await api.get('/buildings')
      setBuildings(response.data.buildings || [])
    } catch (err) {
      console.error('Failed to fetch achievements:', err)
      setError('Failed to load achievements. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    fetchBuildings()
  }

  useEffect(() => {
    const timer = window.setTimeout(fetchBuildings, 0)
    return () => window.clearTimeout(timer)
  }, [fetchBuildings])

  const unlockedBuildings = useMemo(
    () => buildings.filter((building) => building.isUnlocked),
    [buildings],
  )
  const hasFirstUnlock = unlockedBuildings.length > 0

  return (
    <div className="achievements-page">
      <nav className="navbar">
        <div className="navbar-container">
          <h2 className="navbar-logo" onClick={() => navigate('/')}>UOA Quiz</h2>
          <div className="navbar-buttons">
            <div className="user-info">
              <span className="user-greeting">Welcome, {user?.username}</span>
            </div>
            <button className="btn-nav" onClick={() => navigate('/quiz')}>
              Play Quiz
            </button>
            <button className="btn-nav" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="achievements-content">
        <div className="achievements-header">
          <div>
            <h1>Achievements</h1>
            <p>{unlockedBuildings.length} / {buildings.length} building achievements unlocked</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back Home
          </button>
        </div>

        {loading && (
          <div className="achievements-state">
            <div className="loading-spinner"></div>
            <p>Loading achievements...</p>
          </div>
        )}

        {error && !loading && (
          <div className="achievements-state">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="achievement-summary">
              <article className={`achievement-card featured ${hasFirstUnlock ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">{hasFirstUnlock ? '✓' : '•'}</div>
                <div>
                  <h2>First Building Unlocked</h2>
                  <p>
                    {hasFirstUnlock
                      ? `Unlocked when ${unlockedBuildings[0].name} became available.`
                      : 'Unlock any building to earn this achievement.'}
                  </p>
                </div>
              </article>
            </section>

            <section className="achievement-grid">
              {buildings.map((building) => {
                const unlocked = Boolean(building.isUnlocked)

                return (
                  <article
                    key={building.id}
                    className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
                  >
                    <div className="achievement-icon">{unlocked ? '✓' : '•'}</div>
                    <div className="achievement-copy">
                      <span className="achievement-order">Building {building.unlockOrder}</span>
                      <h2>{building.name}</h2>
                      <p>
                        {unlocked
                          ? `Unlocked ${building.shortName || building.name} achievement.`
                          : `Unlock ${building.shortName || building.name} to earn this achievement.`}
                      </p>
                    </div>
                  </article>
                )
              })}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default AchievementsPage
