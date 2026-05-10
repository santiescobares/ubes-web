import { useLocation } from 'react-router-dom'
import UserDropdown from './UserDropdown'

const PAGE_TITLES: Record<string, string> = {
  '/panel': 'Panel de Control',
  '/panel/competencias': 'Competencias',
  '/panel/eventos': 'Eventos',
  '/panel/anuncios': 'Anuncios',
  '/panel/documentos': 'Documentos',
  '/panel/usuarios': 'Usuarios',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'Panel UBES'

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-right">
        <UserDropdown />
      </div>
    </header>
  )
}
