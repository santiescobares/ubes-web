import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Trophy, CalendarDays, Users, FileText } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Panel de Control', icon: LayoutDashboard, exact: true },
  { to: '/competitions', label: 'Competencias', icon: Trophy },
  { to: '/events', label: 'Eventos', icon: CalendarDays },
  { to: '/users', label: 'Usuarios', icon: Users },
  { to: '/documents', label: 'Documentos', icon: FileText },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="px-5 py-4 border-b border-gray-100">
        <span className="font-black text-lg tracking-tight text-gray-900">UBES Panel</span>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
