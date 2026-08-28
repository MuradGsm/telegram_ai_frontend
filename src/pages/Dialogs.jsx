import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react'
import { api } from '../api/client'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { DialogStatusBadge } from '../components/StatusBadge.jsx'

const FILTERS = [
  { value: '', label: 'Все' },
  { value: 'escalated', label: 'Нужен человек' },
  { value: 'open_human', label: 'Ведёт владелец' },
  { value: 'open_auto', label: 'Бот отвечает' },
  { value: 'closed', label: 'Закрытые' },
]

function formatDate(iso) {
  return new Date(iso).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

export default function Dialogs() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const [dialogs, setDialogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  function load() {
    setLoading(true)
    api
      .get(`/workspaces/${workspaceId}/dialogs`, { params: status ? { status } : {} })
      .then(({ data }) => setDialogs(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [workspaceId, status])

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <h1 className="font-display text-xl font-semibold text-ink-100 sm:text-2xl">Диалоги</h1>
      <p className="mt-1 text-xs text-ink-400 sm:text-sm">Переписки бота с клиентами в Telegram.</p>

      {/* Горизонтальный скролл фильтров для мобильных */}
      <div className="mt-4 sm:mt-6 flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              status === f.value
                ? 'bg-signal text-white'
                : 'bg-ink-800 text-ink-400 hover:text-ink-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 sm:mt-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : dialogs.length === 0 ? (
          <EmptyState
            title="Диалогов не найдено"
            hint="Как только клиент напишет боту в Telegram, диалог появится здесь."
          />
        ) : (
          <div className="divide-y divide-ink-800 overflow-hidden rounded-xl border border-ink-700 bg-ink-900/40">
            {dialogs.map((d) => (
              <button
                key={d.id}
                onClick={() => navigate(`/workspaces/${workspaceId}/dialogs/${d.id}`)}
                className="flex w-full flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4 hover:bg-ink-900 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-100">
                    {d.customer_display_name || `Клиент #${d.customer_telegram_id}`}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-ink-600">
                    id {d.customer_telegram_id}
                  </p>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 border-t border-ink-800/40 sm:border-0 sm:pt-0">
                  <span className="text-[11px] sm:text-xs text-ink-400 whitespace-nowrap">
                    {formatDate(d.created_at)}
                  </span>
                  <DialogStatusBadge status={d.status} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}