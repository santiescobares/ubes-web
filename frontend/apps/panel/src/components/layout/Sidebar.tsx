import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Trophy,
  Calendar,
  Bell,
  FileText,
  Users,
} from 'lucide-react'
import logoImg from '@/assets/logo.png'

const navItems = [
  { to: '/panel', label: 'Panel de Control', icon: LayoutDashboard, end: true },
  { to: '/panel/competencias', label: 'Competencias', icon: Trophy },
  { to: '/panel/eventos', label: 'Eventos', icon: Calendar },
  { to: '/panel/anuncios', label: 'Anuncios', icon: Bell },
  { to: '/panel/documentos', label: 'Documentos', icon: FileText },
  { to: '/panel/usuarios', label: 'Usuarios', icon: Users },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img
          src={logoImg}
          alt="UBES"
          style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }}
        />
        <span className="sidebar-logo-text">
          UBES<span style={{ color: '#FACC15' }}>.</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Menú</span>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={15} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-version">v0.1</span>
      </div>
    </aside>
  )
}
