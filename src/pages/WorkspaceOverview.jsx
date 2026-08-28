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
      .catch((err) => {
        console.error('Ошибка загрузки воркспейса:', err)
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
    } catch (err) {
      console.error('Ошибка сохранения владельца:', err)
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
    } catch (err) {
      console.error('Ошибка удаления:', err)
    } finally {
      setDeleting(false)
    }
  }

  if (loading || !workspace) {
    return (
      <div className="flex h-full items-center justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
      <h1 className="font-display text-xl font-semibold text-ink-100 sm:text-2xl">{workspace.name}</h1>
      <p className="mt-1 text-xs text-ink-400 sm:text-sm">
        Тариф <span className="font-mono uppercase">{workspace.plan_tier}</span> ·{' '}
        {workspace.messages_used_this_period} / {workspace.monthly_message_limit} сообщений
        использовано в этом периоде
      </p>

      {/* Подключение бота */}
      <section className="mt-6 rounded-xl border border-ink-700 bg-ink-900 p-4 sm:mt-8 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-medium text-ink-100 sm:text-base">Telegram-бот</h2>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              workspace.is_bot_active ? 'bg-good/10 text-good' : 'bg-ink-700 text-ink-400'
            }`}
          >
            {workspace.is_bot_active ? 'подключен' : 'не подключен'}
          </span>
        </div>

        {workspace.telegram_bot_username && (
          <p className="mt-2 text-xs text-ink-400 sm:text-sm">
            Текущий бот: <span className="text-ink-100">@{workspace.telegram_bot_username}</span>
          </p>
        )}

        <form onSubmit={handleConnect} className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-ink-200 sm:text-sm">
            Токен бота от @BotFather
          </label>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <input
              required
              minLength={20}
              disabled={connecting}
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              className="w-full flex-1 rounded-lg border border-ink-700 bg-ink-800 px-3.5 py-2.5 font-mono text-xs text-ink-100 outline-none transition-all placeholder:text-ink-600 focus:border-signal focus:ring-1 focus:ring-signal disabled:opacity-60 sm:text-sm"
            />
            <button
              type="submit"
              disabled={connecting}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-signal px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-signal-strong disabled:opacity-60"
            >
              {connecting && <Spinner size={14} />}
              {connecting
                ? 'Сохранение...'
                : workspace.telegram_bot_username
                ? 'Переподключить'
                : 'Подключить'}
            </button>
          </div>
          {connectError && <p className="mt-2 text-xs sm:text-sm text-bad">{connectError}</p>}
          {connectSuccess && <p className="mt-2 text-xs sm:text-sm text-good">Бот подключен.</p>}
        </form>
      </section>

      {/* Владелец в Telegram */}
      <section className="mt-4 rounded-xl border border-ink-700 bg-ink-900 p-4 sm:mt-6 sm:p-5">
        <h2 className="font-display text-sm font-medium text-ink-100 sm:text-base">
          Telegram ID владельца
        </h2>
        <p className="mt-1 text-xs text-ink-400 sm:text-sm">
          Сюда бот пришлёт уведомление, если диалог нужно передать человеку.
        </p>
        <form onSubmit={handleSaveOwner} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <input
            type="number"
            disabled={savingOwner}
            value={ownerTelegramId}
            onChange={(e) => setOwnerTelegramId(e.target.value)}
            placeholder="Например: 123456789"
            className="w-full flex-1 rounded-lg border border-ink-700 bg-ink-800 px-3.5 py-2.5 text-xs text-ink-100 outline-none transition-all placeholder:text-ink-600 focus:border-signal focus:ring-1 focus:ring-signal disabled:opacity-60 sm:text-sm"
          />
          <button
            type="submit"
            disabled={savingOwner}
            className="flex items-center justify-center gap-2 rounded-lg border border-ink-600 px-4 py-2.5 text-sm font-medium text-ink-100 transition-colors hover:bg-ink-800 disabled:opacity-60"
          >
            {savingOwner && <Spinner size={14} />}
            {savingOwner ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </section>

      {/* Опасная зона */}
      <section className="mt-4 rounded-xl border border-bad/30 bg-bad/5 p-4 sm:mt-6 sm:p-5">
        <h2 className="font-display text-sm font-medium text-ink-100 sm:text-base">Удалить воркспейс</h2>
        <p className="mt-1 text-xs text-ink-400 sm:text-sm">
          Бот, документы и все диалоги будут удалены без возможности восстановления.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="mt-4 w-full rounded-lg border border-bad/40 px-4 py-2 text-sm font-medium text-bad transition-colors hover:bg-bad/10 disabled:opacity-60 sm:w-auto"
        >
          {deleting ? 'Удаление...' : 'Удалить воркспейс'}
        </button>
      </section>
    </div>
  )
}