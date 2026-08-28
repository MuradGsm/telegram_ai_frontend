import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
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
      clearTokens()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setTokens(data)
    await loadMe()
  }, [loadMe])

  const register = useCallback(async (email, password, full_name) => {
    await api.post('/auth/register', { email, password, full_name: full_name || null })
    await login(email, password)
  }, [login])

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    
    // Очищаем токен на стороне бэкенда (если метод поддерживается)
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken })
      } catch {
        // Игнорируем ошибки сети при логауте
      }
    }

    clearTokens()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, reloadUser: loadMe }),
    [user, loading, login, register, logout, loadMe]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }
  return context
}