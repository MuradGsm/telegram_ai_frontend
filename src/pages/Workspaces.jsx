import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Workspaces() {
  const navigate = useNavigate()
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [timezone, setTimezone] = useState('Asia/Baku')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  function loadWorkspaces() {
    setLoading(true)
    api
      .get('/workspaces')
      .then(({ data }) => setWorkspaces(data))
      .finally(() => setLoading(false))
  }

  useEffect(loadWorkspaces, [])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      const { data } = await api.post('/workspaces', { name, timezone })
      setShowForm(false)
      setName('')
      navigate(`/workspaces/${data.id}`)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-100">Воркспейсы</h1>
          <p className="mt-1 text-sm text-ink-400">
            Каждый воркспейс — это один Telegram-бот и его база знаний.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white hover:bg-signal-strong"
        >
          + Новый воркспейс
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-6 rounded-xl2 border border-ink-700 bg-ink-900 p-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-ink-200">Название</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Кофейня на Низами"
                className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3.5 py-2.5 text-sm text-ink-100 outline-none focus:border-signal"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-ink-200">Часовой пояс</label>
              <input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3.5 py-2.5 text-sm text-ink-100 outline-none focus:border-signal"
              />
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-bad">{error}</p>}
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white hover:bg-signal-strong disabled:opacity-60"
            >
              {creating && <Spinner size={14} />}
              Создать
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg px-4 py-2 text-sm text-ink-400 hover:text-ink-200"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : workspaces.length === 0 ? (
          <EmptyState
            title="Пока нет ни одного воркспейса"
            hint="Создай первый, чтобы подключить Telegram-бота и базу знаний."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => navigate(`/workspaces/${w.id}`)}
                className="rounded-xl2 border border-ink-700 bg-ink-900 p-5 text-left transition-colors hover:border-signal"
              >
                <div className="flex items-start justify-between">
                  <p className="font-display text-base font-medium text-ink-100">{w.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      w.is_bot_active
                        ? 'bg-good/10 text-good'
                        : 'bg-ink-700 text-ink-400'
                    }`}
                  >
                    {w.is_bot_active ? 'бот активен' : 'бот не подключен'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-400">
                  {w.telegram_bot_username ? `@${w.telegram_bot_username}` : 'Без бота'} ·{' '}
                  {w.timezone}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-ink-400">
                  <span className="font-mono uppercase tracking-wide">{w.plan_tier}</span>
                  <span>
                    {w.messages_used_this_period} / {w.monthly_message_limit} сообщений
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
