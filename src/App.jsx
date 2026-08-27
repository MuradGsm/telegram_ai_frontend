import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Workspaces from './pages/Workspaces.jsx'
import WorkspaceOverview from './pages/WorkspaceOverview.jsx'
import Documents from './pages/Documents.jsx'
import Dialogs from './pages/Dialogs.jsx'
import DialogDetail from './pages/DialogDetail.jsx'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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
