import { useLocation, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import UserDropdown from './UserDropdown'
import { useBreadcrumb } from '@/context/BreadcrumbContext'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Panel de Control',
  '/competencias': 'Competencias',
  '/eventos': 'Eventos',
  '/anuncios': 'Anuncios',
  '/documentos': 'Documentos',
  '/usuarios': 'Usuarios',
  '/auditoria': 'Auditoría',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const { entries } = useBreadcrumb()
  const title = PAGE_TITLES[pathname] ?? 'Panel UBES'

  return (
    <header className="topbar">
      <span className="topbar-title">
        {entries.length > 0 ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            {entries.map((entry, i) => {
              const isLast = i === entries.length - 1
              return (
                <span key={i} style={{ display: 'contents' }}>
                  {i > 0 && <ChevronRight size={12} style={{ opacity: 0.35, flexShrink: 0 }} />}
                  {isLast || !entry.to
                    ? <span style={isLast ? undefined : { color: 'var(--muted)', fontWeight: 500 }}>{entry.label}</span>
                    : <Link to={entry.to} style={{ color: 'var(--muted)', fontWeight: 500, textDecoration: 'none' }}>{entry.label}</Link>
                  }
                </span>
              )
            })}
          </span>
        ) : title}
      </span>
      <div className="topbar-right">
        <UserDropdown />
      </div>
    </header>
  )
}
