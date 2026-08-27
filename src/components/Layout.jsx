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

  useEffect(() => {
    api.get('/workspaces').then(({ data }) => setWorkspaces(data)).catch(() => {})
  }, [location.pathname])

  const current = workspaces.find((w) => w.id === workspaceId)

  return (
    <div className="flex h-screen bg-ink-950">
      <aside className="flex w-64 shrink-0 flex-col border-r border-ink-800 bg-ink-900">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-signal font-display text-sm font-semibold text-white">
            S
          </div>
          <span className="font-display text-sm font-semibold tracking-tight text-ink-100">
            Support Console
          </span>
        </div>

        {workspaceId && (
          <div className="px-3 pb-2">
            <select
              value={workspaceId}
              onChange={(e) => navigate(`/workspaces/${e.target.value}`)}
              className="w-full rounded-lg border border-ink-700 bg-ink-800 px-2.5 py-2 text-sm text-ink-100 focus:border-signal"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="flex-1 space-y-0.5 px-3">
          <NavLink to="/workspaces" end className={navClass}>
            Все воркспейсы
          </NavLink>

          {workspaceId && (
            <>
              <div className="mt-4 mb-1 px-3 font-mono text-[11px] uppercase tracking-wider text-ink-600">
                {current?.name || '...'}
              </div>
              <NavLink to={`/workspaces/${workspaceId}`} end className={navClass}>
                Обзор и бот
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
            className="mt-2 text-xs font-medium text-ink-400 hover:text-bad"
          >
            Выйти
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <Outlet />
      </main>
    </div>
  )
}
