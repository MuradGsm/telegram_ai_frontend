import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Корректная обработка WebSocket URL как для http -> ws, так и для https -> wss
export const WS_URL = API_URL.startsWith('https://')
  ? API_URL.replace(/^https:\/\//, 'wss://')
  : API_URL.replace(/^http:\/\//, 'ws://')

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
})

function getTokens() {
  return {
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  }
}

export function setTokens({ access_token, refresh_token }) {
  if (access_token) localStorage.setItem('access_token', access_token)
  if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export function getAccessToken() {
  return localStorage.getItem('access_token')
}

// Подставляем access-токен в каждый запрос
api.interceptors.request.use((config) => {
  const { access } = getTokens()
  if (access) {
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

// Автоматический рефреш токена с дедупликацией запросов
let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status

    // Проверяем статус 401 и исключаем повторный цикл для запроса рефреша
    if (status === 401 && !original._retry && !original.url?.includes('/auth/refresh')) {
      original._retry = true
      const { refresh } = getTokens()

      if (!refresh) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(
              `${API_URL}/auth/refresh`,
              { refresh_token: refresh },
              {
                headers: {
                  'ngrok-skip-browser-warning': 'true',
                },
              },
            )
            .finally(() => {
              refreshPromise = null
            })
        }
        const { data } = await refreshPromise
        setTokens(data)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch (refreshError) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export function extractErrorMessage(error) {
  const detail = error?.response?.data?.detail
  if (!detail) return 'Что-то пошло не так. Попробуй ещё раз.'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || d.detail).join('; ')
  }
  return 'Что-то пошло не так. Попробуй ещё раз.'
}