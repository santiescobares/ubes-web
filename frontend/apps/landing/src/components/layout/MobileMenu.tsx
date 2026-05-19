import { Link, useLocation } from 'react-router-dom'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

function MobileNavLink({ hash, children, onClose }: { hash: string; children: React.ReactNode; onClose: () => void }) {
  const { pathname } = useLocation()
  if (pathname === '/') {
    return <a href={`#${hash}`} onClick={onClose}>{children}<span>→</span></a>
  }
  return <Link to={`/#${hash}`} onClick={onClose}>{children}<span>→</span></Link>
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <div className={`mobile-menu${open ? ' open' : ''}`} id="mobile-menu">
      <MobileNavLink hash="inicio" onClose={onClose}>Inicio</MobileNavLink>
      <Link to="/calendario" onClick={onClose}>Calendario<span>→</span></Link>
      <Link to="/novedades" onClick={onClose}>Novedades<span>→</span></Link>
      <Link to="/sugerencias" onClick={onClose}>Buzón de Ideas<span>→</span></Link>
      <MobileNavLink hash="historicos" onClose={onClose}>Históricos</MobileNavLink>
      <MobileNavLink hash="informacion" onClose={onClose}>Información</MobileNavLink>
    </div>
  )
}
