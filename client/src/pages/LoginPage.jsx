import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/AuthPages.css'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Add login logic here
    console.log('Login attempt:', { email, password })
    // Redirect to home for now
    navigate('/')
  }

  return (
    <div className="auth-page">
      <nav className="navbar">
        <div className="navbar-container">
          <h2 className="navbar-logo" onClick={() => navigate('/')}>UOA Quiz</h2>
        </div>
      </nav>

      <main className="auth-container">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h1>Login</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-submit">
              Sign In
            </button>
          </form>

          <div className="auth-divider">
            <span>Don't have an account?</span>
          </div>

          <button
            onClick={() => navigate('/register')}
            className="btn btn-secondary btn-alt"
          >
            Create Account
          </button>

          <button
            onClick={() => navigate('/')}
            className="btn-text"
          >
            Back to Home
          </button>
        </div>
      </main>
    </div>
  )
}

export default LoginPage
