import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import PanelLayout from '@/components/layout/PanelLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import CompetenciasPage from '@/pages/CompetenciasPage'
import CompetitionDetailPage from '@/pages/competitions/CompetitionDetailPage'
import EventosPage from '@/pages/EventosPage'
import AnunciosPage from '@/pages/AnunciosPage'
import DocumentosPage from '@/pages/DocumentosPage'
import UsuariosPage from '@/pages/UsuariosPage'
import { useAuthStore } from '@/store/authStore'

function AppInit() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<PanelLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="competencias" element={<CompetenciasPage />} />
          <Route path="competencias/:id" element={<CompetitionDetailPage />} />
          <Route path="eventos" element={<EventosPage />} />
          <Route path="anuncios" element={<AnunciosPage />} />
          <Route path="documentos" element={<DocumentosPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInit />
      <Toaster position="bottom-right" richColors />
    </BrowserRouter>
  )
}
