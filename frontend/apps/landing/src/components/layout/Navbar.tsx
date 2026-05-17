import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoImg from '@/assets/logo.png'
import MobileMenu from './MobileMenu'

function NavAnchorLink({ hash, className, style, children }: { hash: string; className: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const { pathname } = useLocation()
  if (pathname === '/') {
    return <a href={`#${hash}`} className={className} style={style}>{children}</a>
  }
  return <Link to={`/#${hash}`} className={className} style={style}>{children}</Link>
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [inFooter, setInFooter] = useState(false)

  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer) return
    const obs = new IntersectionObserver(
      ([entry]) => setInFooter(entry.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(footer)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <nav
        id="navbar"
        className={inFooter ? 'navbar-in-footer' : ''}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: 'rgba(253,252,248,0.92)', backdropFilter: 'blur(8px)',
          borderBottom: '2px solid rgba(0,0,0,0.08)', height: '80px',
          display: 'flex', alignItems: 'center',
        }}
      >
        <div className="wrap" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <NavAnchorLink hash="inicio" className="" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--ink)' }}>
            <img
              src={logoImg}
              alt="UBES"
              style={{ width: '54px', height: '54px', objectFit: 'contain', transform: 'rotate(-3deg)', transition: 'transform 0.3s ease' }}
              onMouseOver={e => { (e.currentTarget as HTMLImageElement).style.transform = 'rotate(0deg) scale(1.05)' }}
              onMouseOut={e => { (e.currentTarget as HTMLImageElement).style.transform = 'rotate(-3deg) scale(1)' }}
            />
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '22px', letterSpacing: '-0.04em' }}>
              UBES<span style={{ color: '#FACC15' }}>.</span>
            </span>
          </NavAnchorLink>

          {/* Desktop links */}
          <div className="hide-md" style={{ alignItems: 'center', gap: '24px' }}>
            <NavAnchorLink hash="inicio" className="nav-link y">Inicio</NavAnchorLink>
            <Link to="/calendario" className="nav-link r">Calendario</Link>
            <NavAnchorLink hash="novedades" className="nav-link b">Novedades</NavAnchorLink>
            <NavAnchorLink hash="buzon" className="nav-link o">Buzón de Ideas</NavAnchorLink>
            <NavAnchorLink hash="historicos" className="nav-link g">Históricos</NavAnchorLink>
            <NavAnchorLink hash="informacion" className="nav-link p">Información</NavAnchorLink>
          </div>

          {/* Desktop login */}
          <div className="hide-md" style={{ alignItems: 'center', gap: '14px' }}>
            <a href="#" className="btn btn-outline" style={{ padding: '10px 22px', fontSize: '14px' }}>
              Ingresar
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Mobile */}
          <div className="show-md" style={{ alignItems: 'center', gap: '10px' }}>
            <a href="#" style={{
              fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '13px',
              border: '2px solid var(--ink)', padding: '7px 14px',
              background: 'transparent', color: 'var(--ink)', textDecoration: 'none',
              boxShadow: '2px 2px 0 var(--ink)',
            }}>Ingresar</a>
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                border: '2px solid var(--ink)', background: 'white', padding: '7px',
                boxShadow: '2px 2px 0 var(--ink)', cursor: 'pointer',
              }}
            >
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
