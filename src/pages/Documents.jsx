import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { DocumentStatusBadge } from '../components/StatusBadge.jsx'

function formatDate(iso) {
  return new Date(iso).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

export default function Documents() {
  const { workspaceId } = useParams()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  function load() {
    setLoading(true)
    api
      .get(`/workspaces/${workspaceId}/documents`)
      .then(({ data }) => setDocuments(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [workspaceId])

  // подтягиваем статус, пока есть документы в обработке
  useEffect(() => {
    const hasPending = documents.some((d) => d.status === 'processing' || d.status === 'uploaded')
    if (!hasPending) return
    const interval = setInterval(load, 4000)
    return () => clearInterval(interval)
  }, [documents, workspaceId])

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await api.post(`/workspaces/${workspaceId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDelete(docId) {
    if (!confirm('Удалить документ из базы знаний?')) return
    setDocuments((prev) => prev.filter((d) => d.id !== docId))
    await api.delete(`/workspaces/${workspaceId}/documents/${docId}`)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-100 sm:text-2xl">База знаний</h1>
          <p className="mt-1 text-xs text-ink-400 sm:text-sm">
            Документы, из которых бот берёт ответы для клиентов.
          </p>
        </div>
        <label className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white hover:bg-signal-strong disabled:opacity-60">
          {uploading && <Spinner size={14} />}
          <span>{uploading ? 'Загрузка...' : 'Загрузить файл'}</span>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {error && <p className="mt-4 text-xs sm:text-sm text-bad">{error}</p>}

      <div className="mt-6 sm:mt-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            title="Документов пока нет"
            hint="Загрузи первый файл — например, прайс или FAQ, — и бот начнёт отвечать по нему."
          />
        ) : (
          <>
            {/* Десктопная версия (Таблица) */}
            <div className="hidden overflow-hidden rounded-xl border border-ink-700 sm:block">
              <table className="w-full text-sm">
                <thead className="bg-ink-900 text-left text-xs uppercase tracking-wide text-ink-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Файл</th>
                    <th className="px-4 py-3 font-medium">Статус</th>
                    <th className="px-4 py-3 font-medium">Фрагментов</th>
                    <th className="px-4 py-3 font-medium">Загружен</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-800 bg-ink-900/40">
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-4 py-3 font-medium text-ink-100 break-all">{doc.file_name}</td>
                      <td className="px-4 py-3">
                        <DocumentStatusBadge status={doc.status} errorMessage={doc.error_message} />
                      </td>
                      <td className="px-4 py-3 text-ink-400">{doc.chunk_count}</td>
                      <td className="px-4 py-3 text-ink-400 whitespace-nowrap">{formatDate(doc.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-xs font-medium text-ink-400 hover:text-bad"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Мобильная версия (Карточки) */}
            <div className="flex flex-col gap-3 sm:hidden">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col gap-3 rounded-xl border border-ink-700 bg-ink-900/40 p-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm text-ink-100 break-all">{doc.file_name}</span>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-xs font-medium text-ink-400 hover:text-bad"
                    >
                      Удалить
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-ink-800/60 pt-2.5 text-xs text-ink-400">
                    <DocumentStatusBadge status={doc.status} errorMessage={doc.error_message} />
                    <div className="flex items-center gap-2">
                      <span>{doc.chunk_count} фрагм.</span>
                      <span>·</span>
                      <span>{formatDate(doc.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}