export default function EmptyState({ title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-ink-700 py-16 text-center">
      <p className="font-display text-base text-ink-100">{title}</p>
      {hint && <p className="mt-1.5 max-w-sm text-sm text-ink-400">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
