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
import { useAuthStore } from '@/store/authStore'
import { hasExecutiveAccess } from '@/lib/roleUtils'

const baseNavItems = [
  { to: '/', label: 'Panel de Control', icon: LayoutDashboard, end: true, executiveOnly: false },
  { to: '/competencias', label: 'Competencias', icon: Trophy, executiveOnly: false },
  { to: '/eventos', label: 'Eventos', icon: Calendar, executiveOnly: false },
  { to: '/anuncios', label: 'Anuncios', icon: Bell, executiveOnly: false },
  { to: '/documentos', label: 'Documentos', icon: FileText, executiveOnly: false },
  { to: '/usuarios', label: 'Usuarios', icon: Users, executiveOnly: true },
]

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const isExecutive = user ? hasExecutiveAccess(user.role) : false

  const navItems = baseNavItems.filter((item) => !item.executiveOnly || isExecutive)

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
