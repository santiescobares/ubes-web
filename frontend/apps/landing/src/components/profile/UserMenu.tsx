import { useRef, useState, useEffect } from 'react'
import { UserCircle, LogOut, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import type { UserDTO } from '@ubes/types'
import UserAvatar from './UserAvatar'
import useAuthStore from '@/store/authStore'
import useProfileModalStore from '@/store/profileModalStore'
import { ROLE_LABELS } from '@/constants/roles'

interface UserMenuProps {
  user: UserDTO
}

export default function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const logout = useAuthStore(s => s.logout)
  const openProfile = useProfileModalStore(s => s.openProfile)

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  async function handleLogout() {
    setOpen(false)
    await logout()
    toast.success('Sesión cerrada')
  }

  function handleProfile() {
    setOpen(false)
    openProfile()
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className={`user-menu-btn${open ? ' user-menu-btn--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserAvatar pictureURL={user.pictureURL} firstName={user.firstName} lastName={user.lastName} size={32} />
        <span className="user-menu-btn-name">{user.firstName} {user.lastName}</span>
        <ChevronDown size={14} className="user-menu-btn-chevron" />
      </button>

      {open && (
        <div className="user-menu-dropdown" role="menu">
          <div className="user-menu-info">
            <div className="user-menu-info-name">{user.firstName} {user.lastName}</div>
            <div className="user-menu-info-role">{ROLE_LABELS[user.role]}</div>
          </div>
          <div className="user-menu-actions">
            <button type="button" className="user-menu-action" role="menuitem" onClick={handleProfile}>
              <UserCircle size={15} />
              Ver Perfil
            </button>
            <button type="button" className="user-menu-action user-menu-action--danger" role="menuitem" onClick={handleLogout}>
              <LogOut size={15} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
