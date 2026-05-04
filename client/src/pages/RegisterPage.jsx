import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/AuthPages.css'

function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    // TODO: Add registration logic here
    console.log('Registration attempt:', { fullName, email, password })
    // Redirect to login for now
    navigate('/login')
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
            <h1>Create Account</h1>
            <p>Join the UOA Quiz and start learning</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

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
                placeholder="Create a password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-submit">
              Create Account
            </button>
          </form>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="btn btn-secondary btn-alt"
          >
            Sign In
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

export default RegisterPage
