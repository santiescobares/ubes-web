import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LandingPage from '@/pages/LandingPage'
import CalendarioPage from '@/pages/CalendarioPage'
import NovedadesPage from '@/pages/NovedadesPage'

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
  return (
    <BrowserRouter>
      <div className="grid-bg" />
      <Navbar />
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/calendario" element={<CalendarioPage />} />
        <Route path="/novedades" element={<NovedadesPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
