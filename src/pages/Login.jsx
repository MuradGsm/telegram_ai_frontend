import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { extractErrorMessage } from '../api/client'
import Spinner from '../components/Spinner.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
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
      navigate('/workspaces')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-signal font-display text-sm font-semibold text-white">
            S
          </div>
          <span className="font-display text-base font-semibold text-ink-100">
            Support Console
          </span>
        </div>

        <h1 className="font-display text-2xl font-semibold text-ink-100">С возвращением</h1>
        <p className="mt-1.5 text-sm text-ink-400">Войди, чтобы посмотреть свои воркспейсы.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-ink-200">Почта</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-sm text-ink-100 outline-none focus:border-signal"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-ink-200">Пароль</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-sm text-ink-100 outline-none focus:border-signal"
              placeholder="Минимум 8 символов"
            />
          </div>

          {error && <p className="text-sm text-bad">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-signal py-2.5 text-sm font-medium text-white transition-colors hover:bg-signal-strong disabled:opacity-60"
          >
            {loading && <Spinner size={16} />}
            Войти
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-400">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-signal hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}
