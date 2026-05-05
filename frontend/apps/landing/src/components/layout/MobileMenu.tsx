interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <div className={`mobile-menu${open ? ' open' : ''}`} id="mobile-menu">
      <a href="#inicio" onClick={onClose}>Inicio<span>→</span></a>
      <a href="#calendario" onClick={onClose}>Calendario<span>→</span></a>
      <a href="#novedades" onClick={onClose}>Novedades<span>→</span></a>
      <a href="#buzon" onClick={onClose}>Buzón de Ideas<span>→</span></a>
      <a href="#historicos" onClick={onClose}>Históricos<span>→</span></a>
      <a href="#informacion" onClick={onClose}>Información<span>→</span></a>
    </div>
  )
}
