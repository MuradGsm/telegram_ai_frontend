import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client'
import Spinner from '../components/Spinner.jsx'

export default function WorkspaceOverview() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const [workspace, setWorkspace] = useState(null)
  const [loading, setLoading] = useState(true)

  const [botToken, setBotToken] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')
  const [connectSuccess, setConnectSuccess] = useState(false)

  const [ownerTelegramId, setOwnerTelegramId] = useState('')
  const [savingOwner, setSavingOwner] = useState(false)

  const [deleting, setDeleting] = useState(false)

  function load() {
    setLoading(true)
    api
      .get(`/workspaces/${workspaceId}`)
      .then(({ data }) => {
        setWorkspace(data)
        setOwnerTelegramId(data.owner_telegram_id || '')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [workspaceId])

  async function handleConnect(e) {
    e.preventDefault()
    setConnectError('')
    setConnectSuccess(false)
    setConnecting(true)
    try {
      const { data } = await api.post(`/workspaces/${workspaceId}/connect-bot`, {
        telegram_bot_token: botToken,
      })
      setWorkspace(data)
      setBotToken('')
      setConnectSuccess(true)
    } catch (err) {
      setConnectError(extractErrorMessage(err))
    } finally {
      setConnecting(false)
    }
  }

  async function handleSaveOwner(e) {
    e.preventDefault()
    setSavingOwner(true)
    try {
      const { data } = await api.patch(`/workspaces/${workspaceId}`, {
        owner_telegram_id: ownerTelegramId ? Number(ownerTelegramId) : null,
      })
      setWorkspace(data)
    } finally {
      setSavingOwner(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Удалить воркспейс «${workspace.name}»? Это необратимо.`)) return
    setDeleting(true)
    try {
      await api.delete(`/workspaces/${workspaceId}`)
      navigate('/workspaces')
    } finally {
      setDeleting(false)
    }
  }

  if (loading || !workspace) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink-100">{workspace.name}</h1>
      <p className="mt-1 text-sm text-ink-400">
        Тариф <span className="font-mono uppercase">{workspace.plan_tier}</span> ·{' '}
        {workspace.messages_used_this_period} / {workspace.monthly_message_limit} сообщений
        использовано в этом периоде
      </p>

      {/* Подключение бота */}
      <section className="mt-8 rounded-xl2 border border-ink-700 bg-ink-900 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-medium text-ink-100">Telegram-бот</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              workspace.is_bot_active ? 'bg-good/10 text-good' : 'bg-ink-700 text-ink-400'
            }`}
          >
            {workspace.is_bot_active ? 'подключен' : 'не подключен'}
          </span>
        </div>

        {workspace.telegram_bot_username && (
          <p className="mt-2 text-sm text-ink-400">
            Текущий бот: <span className="text-ink-100">@{workspace.telegram_bot_username}</span>
          </p>
        )}

        <form onSubmit={handleConnect} className="mt-4">
          <label className="mb-1.5 block text-sm text-ink-200">
            Токен бота от @BotFather
          </label>
          <div className="flex gap-2">
            <input
              required
              minLength={20}
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              className="flex-1 rounded-lg border border-ink-700 bg-ink-800 px-3.5 py-2.5 font-mono text-sm text-ink-100 outline-none focus:border-signal"
            />
            <button
              type="submit"
              disabled={connecting}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-signal px-4 py-2.5 text-sm font-medium text-white hover:bg-signal-strong disabled:opacity-60"
            >
              {connecting && <Spinner size={14} />}
              {workspace.telegram_bot_username ? 'Переподключить' : 'Подключить'}
            </button>
          </div>
          {connectError && <p className="mt-2 text-sm text-bad">{connectError}</p>}
          {connectSuccess && <p className="mt-2 text-sm text-good">Бот подключен.</p>}
        </form>
      </section>

      {/* Владелец в Telegram (получает эскалации) */}
      <section className="mt-6 rounded-xl2 border border-ink-700 bg-ink-900 p-5">
        <h2 className="font-display text-base font-medium text-ink-100">
          Telegram ID владельца
        </h2>
        <p className="mt-1 text-sm text-ink-400">
          Сюда бот пришлёт уведомление, если диалог нужно передать человеку.
        </p>
        <form onSubmit={handleSaveOwner} className="mt-4 flex gap-2">
          <input
            type="number"
            value={ownerTelegramId}
            onChange={(e) => setOwnerTelegramId(e.target.value)}
            placeholder="Например: 123456789"
            className="flex-1 rounded-lg border border-ink-700 bg-ink-800 px-3.5 py-2.5 text-sm text-ink-100 outline-none focus:border-signal"
          />
          <button
            type="submit"
            disabled={savingOwner}
            className="flex items-center gap-2 rounded-lg border border-ink-600 px-4 py-2.5 text-sm font-medium text-ink-100 hover:bg-ink-800 disabled:opacity-60"
          >
            {savingOwner && <Spinner size={14} />}
            Сохранить
          </button>
        </form>
      </section>

      {/* Опасная зона */}
      <section className="mt-6 rounded-xl2 border border-bad/30 bg-bad/5 p-5">
        <h2 className="font-display text-base font-medium text-ink-100">Удалить воркспейс</h2>
        <p className="mt-1 text-sm text-ink-400">
          Бот, документы и все диалоги будут удалены без возможности восстановления.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="mt-4 rounded-lg border border-bad/40 px-4 py-2 text-sm font-medium text-bad hover:bg-bad/10 disabled:opacity-60"
        >
          {deleting ? 'Удаление...' : 'Удалить воркспейс'}
        </button>
      </section>
    </div>
  )
}
