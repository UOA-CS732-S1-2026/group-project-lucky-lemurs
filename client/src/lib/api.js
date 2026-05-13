import axios from 'axios'

// Keep endpoint joining predictable even when the env value includes a trailing slash.
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/+$/, '')

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export function resolveApiUrl(path) {
  if (!path) {
    return ''
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export default api
