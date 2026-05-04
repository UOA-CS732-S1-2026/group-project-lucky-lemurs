import { Component } from 'react'
import { useNavigate } from 'react-router-dom'

function ErrorFallback({ error, resetError }) {
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
          <h1 className="error-title">Oops! Something went wrong</h1>
          <p className="error-message">{error?.message || 'An unexpected error occurred'}</p>
          <div className="error-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Go Home
            </button>
            <button className="btn btn-secondary" onClick={resetError}>
              Try Again
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({ 
          error: this.state.error, 
          resetError: this.resetError 
        })
      }
      return <ErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

export default ErrorBoundary