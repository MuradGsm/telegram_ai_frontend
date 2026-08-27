const DIALOG_STATUS = {
  open_auto: { label: 'Бот отвечает', dot: 'bg-signal', text: 'text-signal' },
  escalated: { label: 'Нужен человек', dot: 'bg-warn', text: 'text-warn' },
  open_human: { label: 'Ведёт владелец', dot: 'bg-good', text: 'text-good' },
  closed: { label: 'Закрыт', dot: 'bg-ink-400', text: 'text-ink-400' },
}

const DOCUMENT_STATUS = {
  uploaded: { label: 'Загружен', dot: 'bg-ink-400', text: 'text-ink-400' },
  processing: { label: 'Обрабатывается', dot: 'bg-signal', text: 'text-signal' },
  indexed: { label: 'Готов', dot: 'bg-good', text: 'text-good' },
  failed: { label: 'Ошибка', dot: 'bg-bad', text: 'text-bad' },
}

export function DialogStatusBadge({ status }) {
  const cfg = DIALOG_STATUS[status] || DIALOG_STATUS.closed
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export function DocumentStatusBadge({ status, errorMessage }) {
  const cfg = DOCUMENT_STATUS[status] || DOCUMENT_STATUS.uploaded
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}
      title={status === 'failed' ? errorMessage || undefined : undefined}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
