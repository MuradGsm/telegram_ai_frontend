const DIALOG_STATUS = {
  open_auto: { label: 'Бот отвечает', dot: 'bg-signal', text: 'text-signal' },
  escalated: { label: 'Нужен человек', dot: 'bg-warn', text: 'text-warn' },
  open_human: { label: 'Ведёт владелец', dot: 'bg-good', text: 'text-good' },
  closed: { label: 'Закрыт', dot: 'bg-ink-400', text: 'text-ink-400' },
}

const DOCUMENT_STATUS = {
  uploaded: { label: 'Загружен', dot: 'bg-ink-400', text: 'text-ink-400' },
  processing: { label: 'Обрабатывается', dot: 'bg-signal animate-pulse', text: 'text-signal' },
  indexed: { label: 'Готов', dot: 'bg-good', text: 'text-good' },
  failed: { label: 'Ошибка', dot: 'bg-bad', text: 'text-bad' },
}

const CHANNEL_CONFIG = {
  telegram: { label: 'Telegram', color: 'text-sky-400 bg-sky-400/10' },
  instagram: { label: 'Instagram', color: 'text-pink-400 bg-pink-400/10' },
  whatsapp: { label: 'WhatsApp', color: 'text-emerald-400 bg-emerald-400/10' },
  web: { label: 'Web Widget', color: 'text-indigo-400 bg-indigo-400/10' },
}

export function DialogStatusBadge({ status }) {
  const cfg = DIALOG_STATUS[status] || DIALOG_STATUS.closed
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export function DocumentStatusBadge({ status, errorMessage }) {
  const cfg = DOCUMENT_STATUS[status] || DOCUMENT_STATUS.uploaded
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${cfg.text}`}
      title={status === 'failed' ? errorMessage || undefined : undefined}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export function ChannelTypeBadge({ type }) {
  const cfg = CHANNEL_CONFIG[type] || { label: type, color: 'text-ink-300 bg-ink-800' }
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}
