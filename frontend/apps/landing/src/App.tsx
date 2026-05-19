import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LandingPage from '@/pages/LandingPage'
import CalendarioPage from '@/pages/CalendarioPage'
import NovedadesPage from '@/pages/NovedadesPage'
import SugerenciasPage from '@/pages/SugerenciasPage'
import LoginModal from '@/components/auth/LoginModal'
import RegisterModal from '@/components/auth/RegisterModal'
import ProfileModal from '@/components/profile/ProfileModal'
import DeleteAccountModal from '@/components/profile/DeleteAccountModal'
import useAuthStore from '@/store/authStore'

function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const el = document.getElementById(location.hash.slice(1))
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location])

  return null
}

function App() {
  useEffect(() => {
    useAuthStore.getState().initialize()
  }, [])

  return (
    <BrowserRouter>
      <div className="grid-bg" />
      <Navbar />
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/calendario" element={<CalendarioPage />} />
        <Route path="/novedades" element={<NovedadesPage />} />
        <Route path="/sugerencias" element={<SugerenciasPage />} />
      </Routes>
      <Footer />
      <LoginModal />
      <RegisterModal />
      <ProfileModal />
      <DeleteAccountModal />
      <Toaster richColors position="bottom-right" />
    </BrowserRouter>
  )
}

export default App
