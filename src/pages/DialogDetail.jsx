import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client'
import Spinner from '../components/Spinner.jsx'
import { DialogStatusBadge } from '../components/StatusBadge.jsx'

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

const BUBBLE_STYLE = {
  customer: 'self-start bg-ink-800 text-ink-100',
  bot: 'self-end bg-signal/15 text-ink-100 border border-signal/30',
  owner: 'self-end bg-signal text-white',
  system: 'self-center bg-ink-900 text-ink-400 text-xs italic border border-ink-700',
}

const SENDER_LABEL = {
  customer: 'Клиент',
  bot: 'Бот',
  owner: 'Ты',
  system: 'Система',
}

export default function DialogDetail() {
  const { workspaceId, dialogId } = useParams()
  const [dialog, setDialog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [closing, setClosing] = useState(false)

  function load() {
    api.get(`/workspaces/${workspaceId}/dialogs/${dialogId}`).then(({ data }) => {
      setDialog(data)
      setLoading(false)
    })
  }

  useEffect(load, [workspaceId, dialogId])

  async function handleReply(e) {
    e.preventDefault()
    if (!reply.trim()) return
    setError('')
    setSending(true)
    try {
      await api.post(`/workspaces/${workspaceId}/dialogs/${dialogId}/reply`, {
        content: reply,
      })
      setReply('')
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  async function handleClose() {
    setClosing(true)
    try {
      const { data } = await api.post(`/workspaces/${workspaceId}/dialogs/${dialogId}/close`)
      setDialog((prev) => ({ ...prev, status: data.status }))
    } finally {
      setClosing(false)
    }
  }

  if (loading || !dialog) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const isClosed = dialog.status === 'closed'

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={`/workspaces/${workspaceId}/dialogs`}
            className="text-xs text-ink-400 hover:text-ink-200"
          >
            ← Все диалоги
          </Link>
          <h1 className="mt-1 font-display text-xl font-semibold text-ink-100">
            {dialog.customer_display_name || `Клиент #${dialog.customer_telegram_id}`}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <DialogStatusBadge status={dialog.status} />
          {!isClosed && (
            <button
              onClick={handleClose}
              disabled={closing}
              className="rounded-lg border border-ink-600 px-3 py-1.5 text-xs font-medium text-ink-200 hover:bg-ink-800 disabled:opacity-60"
            >
              {closing ? 'Закрываю...' : 'Закрыть диалог'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-3 overflow-y-auto scrollbar-thin pr-1">
        {dialog.messages.map((m) => (
          <div key={m.id} className={`flex max-w-[75%] flex-col ${BUBBLE_STYLE[m.sender].includes('self-end') ? 'self-end items-end' : BUBBLE_STYLE[m.sender].includes('self-center') ? 'self-center items-center' : 'self-start items-start'}`}>
            <div className={`rounded-xl2 px-4 py-2.5 text-sm ${BUBBLE_STYLE[m.sender]}`}>
              {m.content}
            </div>
            <div className="mt-1 flex items-center gap-1.5 px-1 text-[11px] text-ink-600">
              <span>{SENDER_LABEL[m.sender]}</span>
              <span>·</span>
              <span>{formatTime(m.created_at)}</span>
              {m.sender === 'bot' && m.confidence_score != null && (
                <>
                  <span>·</span>
                  <span>уверенность {Math.round(m.confidence_score * 100)}%</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isClosed ? (
        <form onSubmit={handleReply} className="mt-4 flex gap-2 border-t border-ink-800 pt-4">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            maxLength={4000}
            placeholder="Ответить клиенту от своего имени..."
            className="flex-1 rounded-lg border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-sm text-ink-100 outline-none focus:border-signal"
          />
          <button
            type="submit"
            disabled={sending || !reply.trim()}
            className="flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-medium text-white hover:bg-signal-strong disabled:opacity-60"
          >
            {sending && <Spinner size={14} />}
            Отправить
          </button>
        </form>
      ) : (
        <p className="mt-4 border-t border-ink-800 pt-4 text-center text-sm text-ink-600">
          Диалог закрыт
        </p>
      )}

      {error && <p className="mt-2 text-sm text-bad">{error}</p>}
    </div>
  )
}
