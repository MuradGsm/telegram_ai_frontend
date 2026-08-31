import { NavLink, Outlet, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client'

function navClass({ isActive }) {
  return `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive
      ? 'bg-ink-800 text-ink-100'
      : 'text-ink-400 hover:bg-ink-900 hover:text-ink-200'
  }`
}

export default function Layout() {
  const { user, logout } = useAuth()
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [workspaces, setWorkspaces] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Загрузка воркспейсов
  useEffect(() => {
    api.get('/workspaces').then(({ data }) => setWorkspaces(data)).catch(() => {})
  }, [])

  // Закрытие мобильного меню при смене роута
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const current = workspaces.find((w) => String(w.id) === String(workspaceId))

  return (
    <div className="flex h-screen flex-col bg-ink-950 md:flex-row">
      {/* Мобильный хедер */}
      <header className="flex h-14 items-center justify-between border-b border-ink-800 bg-ink-900 px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-signal font-display text-xs font-semibold text-white">
            S
          </div>
          <span className="font-display text-sm font-semibold text-ink-100">
            Support Console
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-800 hover:text-ink-100"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Оверлей для мобилок */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Боковая панель */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-ink-800 bg-ink-900 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="hidden items-center gap-2 px-5 py-5 md:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-signal font-display text-sm font-semibold text-white">
            S
          </div>
          <span className="font-display text-sm font-semibold tracking-tight text-ink-100">
            Support Console
          </span>
        </div>

        {workspaceId && (
          <div className="px-3 pt-4 pb-2 md:pt-0">
            <select
              value={workspaceId}
              onChange={(e) => navigate(`/workspaces/${e.target.value}`)}
              className="w-full rounded-lg border border-ink-700 bg-ink-800 px-2.5 py-2 text-sm text-ink-100 outline-none focus:border-signal"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="flex-1 space-y-0.5 px-3 py-2">
          <NavLink to="/workspaces" end className={navClass}>
            Все воркспейсы
          </NavLink>

          {workspaceId && (
            <>
              <div className="mt-4 mb-1 truncate px-3 font-mono text-[11px] uppercase tracking-wider text-ink-600">
                {current?.name || '...'}
              </div>
              <NavLink to={`/workspaces/${workspaceId}`} end className={navClass}>
                Обзор
              </NavLink>
              <NavLink to={`/workspaces/${workspaceId}/channels`} className={navClass}>
                Каналы и Интеграции
              </NavLink>
              <NavLink to={`/workspaces/${workspaceId}/documents`} className={navClass}>
                База знаний
              </NavLink>
              <NavLink to={`/workspaces/${workspaceId}/dialogs`} className={navClass}>
                Диалоги
              </NavLink>
            </>
          )}
        </nav>

        <div className="border-t border-ink-800 px-4 py-4">
          <p className="truncate text-xs text-ink-400">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-2 text-xs font-medium text-ink-400 transition-colors hover:text-bad"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <Outlet />
      </main>
    </div>
  )
}