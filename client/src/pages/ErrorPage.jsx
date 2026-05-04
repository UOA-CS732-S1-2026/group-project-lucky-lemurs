import { useNavigate } from 'react-router-dom'
import '../styles/Pages.css'

function ErrorPage({ message = "The page you're looking for doesn't exist." }) {
  const navigate = useNavigate()

  return (
    <div className="error-page">
      <nav className="navbar">
        <div className="navbar-container">
          <h2 className="navbar-logo" onClick={() => navigate('/')}>UOA Quiz</h2>
        </div>
      </nav>

      <section className="error-section">
        <div className="error-content">
          <h1 className="error-title">404</h1>
          <p className="error-subtitle">Page Not Found</p>
          <p className="error-message">{message}</p>
          <div className="error-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Go Home
            </button>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ErrorPage