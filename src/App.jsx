import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Workspaces from './pages/Workspaces.jsx'
import WorkspaceOverview from './pages/WorkspaceOverview.jsx'
import Documents from './pages/Documents.jsx'
import Dialogs from './pages/Dialogs.jsx'
import DialogDetail from './pages/DialogDetail.jsx'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Spinner from './components/Spinner.jsx'

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-950">
        <Spinner />
      </div>
    )
  }

  if (user) {
    const from = location.state?.from?.pathname || '/workspaces'
    return <Navigate to={from} replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/workspaces" element={<Workspaces />} />
        <Route path="/workspaces/:workspaceId" element={<WorkspaceOverview />} />
        <Route path="/workspaces/:workspaceId/documents" element={<Documents />} />
        <Route path="/workspaces/:workspaceId/dialogs" element={<Dialogs />} />
        <Route path="/workspaces/:workspaceId/dialogs/:dialogId" element={<DialogDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/workspaces" replace />} />
    </Routes>
  )
}