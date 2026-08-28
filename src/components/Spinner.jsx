export default function Spinner({ size = 20 }) {
  return (
    <div
      className="shrink-0 animate-spin rounded-full border-2 border-ink-600 border-t-signal"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Загрузка"
    />
  )
}