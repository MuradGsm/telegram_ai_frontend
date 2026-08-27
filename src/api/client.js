import axios from 'axios'

// Базовый адрес бэкенда. Меняй здесь, если бэк крутится не на 8000 порту,
// либо создай .env файл с VITE_API_URL и используй import.meta.env.VITE_API_URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
})

function getTokens() {
  return {
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  }
}

export function setTokens({ access_token, refresh_token }) {
  localStorage.setItem('access_token', access_token)
  localStorage.setItem('refresh_token', refresh_token)
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

// подставляем access-токен в каждый запрос
api.interceptors.request.use((config) => {
  const { access } = getTokens()
  if (access) {
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

// при 401 пробуем один раз обновить токен через /auth/refresh
let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status

    if (status === 401 && !original._retry) {
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
            .post(`${API_URL}/auth/refresh`, { refresh_token: refresh })
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

// Хелпер, чтобы вытащить понятное сообщение об ошибке из ответа FastAPI
export function extractErrorMessage(error) {
  const detail = error?.response?.data?.detail
  if (!detail) return 'Что-то пошло не так. Попробуй ещё раз.'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg).join('; ')
  }
  return 'Что-то пошло не так. Попробуй ещё раз.'
}
