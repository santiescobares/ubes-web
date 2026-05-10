import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PanelLayout from '@/components/layout/PanelLayout'
import CompetitionsListPage from '@/pages/competitions/CompetitionsListPage'
import CompetitionDetailPage from '@/pages/competitions/CompetitionDetailPage'

function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
      <p className="mt-2 text-sm text-gray-500">Bienvenido al panel administrativo de UBES.</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PanelLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="competitions" element={<CompetitionsListPage />} />
          <Route path="competitions/:id" element={<CompetitionDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
