import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client'
import Spinner from '../components/Spinner.jsx'
import { ChannelTypeBadge } from '../components/StatusBadge.jsx'

export default function WorkspaceOverview() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const [workspace, setWorkspace] = useState(null)
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)

  const [telegramToken, setTelegramToken] = useState('')
  const [connectingTg, setConnectingTg] = useState(false)
  const [connectError, setConnectError] = useState('')

  const [ownerTelegramId, setOwnerTelegramId] = useState('')
  const [savingOwner, setSavingOwner] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function load() {
    setLoading(true)
    Promise.all([
      api.get(`/workspaces/${workspaceId}`),
      api.get(`/workspaces/${workspaceId}/channels`),
    ])
      .then(([{ data: wsData }, { data: chData }]) => {
        setWorkspace(wsData)
        setChannels(chData)
        setOwnerTelegramId(wsData.owner_telegram_id || '')
      })
      .catch((err) => {
        console.error('Ошибка загрузки данных воркспейса:', err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [workspaceId])

  async function handleConnectTelegram(e) {
    e.preventDefault()
    setConnectError('')
    setConnectingTg(true)
    try {
      await api.post(`/workspaces/${workspaceId}/channels`, {
        type: 'telegram',
        credentials: { bot_token: telegramToken },
      })
      setTelegramToken('')
      load()
    } catch (err) {
      setConnectError(extractErrorMessage(err))
    } finally {
      setConnectingTg(false)
    }
  }

  async function handleDeleteChannel(channelId) {
    if (!confirm('Отключить этот канал?')) return
    try {
      await api.delete(`/workspaces/${workspaceId}/channels/${channelId}`)
      load()
    } catch (err) {
      console.error('Ошибка удаления канала:', err)
    }
  }

  async function handleSaveOwner(e) {
    e.preventDefault()
    setSavingOwner(true)
    try {
      const { data } = await api.patch(`/workspaces/${workspaceId}`, {
        owner_telegram_id: ownerTelegramId ? String(ownerTelegramId) : null,
      })
      setWorkspace(data)
    } catch (err) {
      console.error('Ошибка сохранения параметров владельца:', err)
    } finally {
      setSavingOwner(false)
    }
  }

  async function handleDeleteWorkspace() {
    if (!confirm(`Удалить воркспейс «${workspace.name}»? Это действие необратимо.`)) return
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
        {workspace.messages_used_this_period} / {workspace.monthly_message_limit} сообщений в этом периоде
      </p>

      {/* Подключенные каналы */}
      <section className="mt-6 rounded-xl border border-ink-700 bg-ink-900 p-4 sm:mt-8 sm:p-5">
        <h2 className="font-display text-sm font-medium text-ink-100 sm:text-base">Подключённые каналы</h2>
        <p className="mt-1 text-xs text-ink-400">Каналы связи, откуда ассистент принимает обращения клиентов.</p>

        <div className="mt-4 flex flex-col gap-2.5">
          {channels.length === 0 ? (
            <p className="py-2 text-xs text-ink-600">Нет активных каналов связи.</p>
          ) : (
            channels.map((ch) => (
              <div key={ch.id} className="flex items-center justify-between rounded-lg border border-ink-800 bg-ink-950/60 p-3">
                <div className="flex items-center gap-3">
                  <ChannelTypeBadge type={ch.type} />
                  <span className="text-xs font-mono text-ink-200">{ch.name || ch.id}</span>
                </div>
                <button
                  onClick={() => handleDeleteChannel(ch.id)}
                  className="text-xs font-medium text-ink-400 hover:text-bad"
                >
                  Отключить
                </button>
              </div>
            ))
          )}
        </div>

        {/* Добавление Telegram Bot */}
        <form onSubmit={handleConnectTelegram} className="mt-5 border-t border-ink-800 pt-4">
          <label className="mb-1.5 block text-xs font-medium text-ink-200 sm:text-sm">
            Подключить Telegram-бота (@BotFather token)
          </label>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <input
              required
              minLength={20}
              disabled={connectingTg}
              value={telegramToken}
              onChange={(e) => setTelegramToken(e.target.value)}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              className="w-full flex-1 rounded-lg border border-ink-700 bg-ink-800 px-3.5 py-2.5 font-mono text-xs text-ink-100 outline-none transition-all placeholder:text-ink-600 focus:border-signal focus:ring-1 focus:ring-signal disabled:opacity-60 sm:text-sm"
            />
            <button
              type="submit"
              disabled={connectingTg}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-signal px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-signal-strong disabled:opacity-60"
            >
              {connectingTg && <Spinner size={14} />}
              {connectingTg ? 'Подключение...' : 'Подключить'}
            </button>
          </div>
          {connectError && <p className="mt-2 text-xs text-bad">{connectError}</p>}
        </form>
      </section>

      {/* Уведомления владельца */}
      <section className="mt-4 rounded-xl border border-ink-700 bg-ink-900 p-4 sm:mt-6 sm:p-5">
        <h2 className="font-display text-sm font-medium text-ink-100 sm:text-base">
          Уведомления для перевода на человека
        </h2>
        <p className="mt-1 text-xs text-ink-400 sm:text-sm">
          Идентификатор владельца (Telegram Chat ID), куда эскалируются обращения при низкой уверенности бота.
        </p>
        <form onSubmit={handleSaveOwner} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <input
            type="text"
            disabled={savingOwner}
            value={ownerTelegramId}
            onChange={(e) => setOwnerTelegramId(e.target.value)}
            placeholder="Например: 123456789"
            className="w-full flex-1 rounded-lg border border-ink-700 bg-ink-800 px-3.5 py-2.5 font-mono text-xs text-ink-100 outline-none transition-all placeholder:text-ink-600 focus:border-signal focus:ring-1 focus:ring-signal disabled:opacity-60 sm:text-sm"
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
          Все подключенные каналы, загруженные документы базы знаний и переписки будут удалены безвозвратно.
        </p>
        <button
          onClick={handleDeleteWorkspace}
          disabled={deleting}
          className="mt-4 w-full rounded-lg border border-bad/40 px-4 py-2 text-sm font-medium text-bad transition-colors hover:bg-bad/10 disabled:opacity-60 sm:w-auto"
        >
          {deleting ? 'Удаление...' : 'Удалить воркспейс'}
        </button>
      </section>
    </div>
  )
}