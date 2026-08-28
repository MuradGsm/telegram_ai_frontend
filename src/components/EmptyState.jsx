export default function EmptyState({ title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-700 px-4 py-10 text-center sm:py-16">
      <p className="font-display text-sm font-medium text-ink-100 sm:text-base">{title}</p>
      {hint && <p className="mt-1.5 max-w-sm text-xs text-ink-400 sm:text-sm">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}