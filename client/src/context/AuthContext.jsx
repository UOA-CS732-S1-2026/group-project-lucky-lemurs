import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      validateToken()
    } else {
      setLoading(false)
    }
  }, [])

  const validateToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/me`)
      setUser(response.data)
    } catch (error) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password })
    const { accessToken, user: userData } = response.data
    
    localStorage.setItem('token', accessToken)
    setToken(accessToken)
    setUser(userData)
    setLoading(false)
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    
    return userData
  }

  const register = async (username, email, password) => {
    const response = await axios.post(`${API_URL}/auth/register`, { username, email, password })
    const { accessToken, user: userData } = response.data
    
    localStorage.setItem('token', accessToken)
    setToken(accessToken)
    setUser(userData)
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    
    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}