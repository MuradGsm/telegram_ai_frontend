import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { extractErrorMessage } from '../api/client'
import Spinner from '../components/Spinner.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Достаем исходный путь из state (если пользователя перенаправил ProtectedRoute)
  const from = location.state?.from?.pathname || '/workspaces'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      // Возвращаем на исходную страницу вместо хардкода '/workspaces'
      navigate(from, { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm">
        {/* Логотип */}
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-signal font-display text-sm font-semibold text-white">
            S
          </div>
          <span className="font-display text-base font-semibold text-ink-100">
            Support Console
          </span>
        </div>

        {/* Заголовок */}
        <h1 className="font-display text-2xl font-semibold text-ink-100 sm:text-3xl">С возвращением</h1>
        <p className="mt-2 text-sm text-ink-400">Войди, чтобы посмотреть свои воркспейсы.</p>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-200 sm:text-sm">Почта</label>
            <input
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-xs text-ink-100 shadow-sm outline-none transition-all placeholder:text-ink-600 focus:border-signal focus:ring-1 focus:ring-signal disabled:opacity-60 sm:text-sm"
              placeholder="you@company.com"
            />
          </div>
          
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-200 sm:text-sm">Пароль</label>
            <input
              type="password"
              required
              minLength={8}
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-xs text-ink-100 shadow-sm outline-none transition-all placeholder:text-ink-600 focus:border-signal focus:ring-1 focus:ring-signal disabled:opacity-60 sm:text-sm"
              placeholder="Минимум 8 символов"
            />
          </div>

          {error && <p className="text-xs sm:text-sm text-bad">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-signal-strong disabled:opacity-60"
          >
            {loading && <Spinner size={16} />}
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-400 sm:text-sm">
          Нет аккаунта?{' '}
          <Link to="/register" className="font-medium text-signal hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}