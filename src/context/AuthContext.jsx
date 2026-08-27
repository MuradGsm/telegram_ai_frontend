import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, setTokens, clearTokens } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    const hasToken = !!localStorage.getItem('access_token')
    if (!hasToken) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const { data } = await api.get('/auth/me')
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    setTokens(data)
    await loadMe()
  }

  async function register(email, password, full_name) {
    await api.post('/auth/register', { email, password, full_name: full_name || null })
    // после регистрации сразу логиним
    await login(email, password)
  }

  function logout() {
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
