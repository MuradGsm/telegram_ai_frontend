import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { extractErrorMessage } from '../api/client'
import Spinner from '../components/Spinner.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password, fullName)
      navigate('/workspaces')
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
        <h1 className="font-display text-2xl font-semibold text-ink-100 sm:text-3xl">Создать аккаунт</h1>
        <p className="mt-2 text-sm text-ink-400">Займёт меньше минуты.</p>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-200">Имя (необязательно)</label>
            <input
              type="text"
              disabled={loading}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-sm text-ink-100 shadow-sm outline-none transition-all placeholder:text-ink-600 focus:border-signal focus:ring-1 focus:ring-signal disabled:opacity-60"
              placeholder="Как к тебе обращаться"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-200">Почта</label>
            <input
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-sm text-ink-100 shadow-sm outline-none transition-all placeholder:text-ink-600 focus:border-signal focus:ring-1 focus:ring-signal disabled:opacity-60"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-200">Пароль</label>
            <input
              type="password"
              required
              minLength={8}
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-sm text-ink-100 shadow-sm outline-none transition-all placeholder:text-ink-600 focus:border-signal focus:ring-1 focus:ring-signal disabled:opacity-60"
              placeholder="Минимум 8 символов"
            />
          </div>

          {error && <p className="text-sm text-bad">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-signal-strong disabled:opacity-60"
          >
            {loading && <Spinner size={16} />}
            {loading ? 'Создаём...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-400">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-medium text-signal hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}