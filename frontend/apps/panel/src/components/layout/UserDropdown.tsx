import { useRef, useEffect, useState } from 'react'
import { UserCircle2, ExternalLink, LogOut, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const LANDING_URL = import.meta.env.VITE_LANDING_URL ?? 'http://localhost:5173'

const ROLE_LABELS: Record<string, string> = {
  DEVELOPER: 'Desarrollador',
  PRESIDENT: 'Presidente',
  VICE_PRESIDENT: 'Vicepresidente',
  SECRETARY: 'Secretario/a',
  SPORT_SECRETARY: 'Sec. Deportes',
  CULTURE_SECRETARY: 'Sec. Cultura',
  PRESS_SECRETARY: 'Sec. Prensa',
  ADMIN_SECRETARY: 'Sec. Administración',
  IIRR_SECRETARY: 'Sec. RRII',
  CANTEEN_SECRETARY: 'Sec. Cantina',
  DELEGATE: 'Delegado/a',
  USER: 'Usuario',
}

export default function UserDropdown() {
  const { user, logout, isLoading } = useAuthStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const displayName = user ? `${user.lastName} ${user.firstName}` : 'Usuario'
  const roleLabel = user ? (ROLE_LABELS[user.role] ?? user.role) : ''

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="user-btn" onClick={() => setOpen(o => !o)}>
        <UserCircle2 size={20} strokeWidth={1.5} style={{ color: 'var(--muted)', flexShrink: 0 }} />
        <span className="user-btn-name">{displayName}</span>
        <ChevronDown
          size={12}
          strokeWidth={2.5}
          style={{
            color: 'var(--muted-light)',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-info">
            <div className="user-dropdown-name">{displayName}</div>
            <div className="user-dropdown-role">{roleLabel}</div>
          </div>

          <div className="user-dropdown-actions">
            <a
              href={LANDING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="user-dropdown-btn"
              onClick={() => setOpen(false)}
            >
              <ExternalLink size={13} strokeWidth={2} />
              Ir a UBES
            </a>
            <button
              className="user-dropdown-btn danger"
              onClick={() => { setOpen(false); logout() }}
              disabled={isLoading}
            >
              <LogOut size={13} strokeWidth={2} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
