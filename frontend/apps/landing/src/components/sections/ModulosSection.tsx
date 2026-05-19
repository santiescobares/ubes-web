import { Link } from 'react-router-dom'

export default function ModulosSection() {
  const linkStyle = {
    marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px',
    fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '13px',
    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
    color: 'var(--ink)', textDecoration: 'none',
    borderBottom: '4px solid var(--ink)', paddingBottom: '3px',
    width: 'max-content', transition: 'background 0.15s',
  }

  return (
    <section id="informacion" style={{ padding: '80px 0', background: 'white', borderTop: '2px solid var(--ink)', borderBottom: '2px solid var(--ink)', position: 'relative', zIndex: 1 }}>
      <div className="wrap">

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '48px' }}>
          <div>
            <span className="badge-tilt" style={{ marginBottom: '16px' }}>Plataforma</span>
            <h2 style={{ fontSize: 'clamp(32px,4.5vw,52px)', textTransform: 'uppercase', marginTop: '18px', lineHeight: 1 }}>
              Todo lo que necesitás,<br />en un solo lugar
            </h2>
          </div>
          <p style={{ maxWidth: '340px', color: '#666', fontSize: '15px', lineHeight: 1.6, fontWeight: 500 }}>
            Cinco módulos pensados para la comunidad estudiantil. Simples, directos y sin vueltas.
          </p>
        </div>

        {/* 3 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '24px' }} id="mod-row-1">

          <div className="float-y-1" style={{ height: '100%' }}>
            <div className="mod">
              <div className="mod-corner" style={{ background: 'var(--yellow)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 style={{ fontSize: '28px', margin: '8px 0 16px' }}>Calendario</h3>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#666', fontWeight: 500, flex: 1 }}>
                Seguí el minuto a minuto de los intercolegiales, eventos y asambleas. Fixtures, fechas límite y resultados oficiales.
              </p>
              <a
                href="#calendario"
                style={linkStyle}
                onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--yellow)' }}
                onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
              >Ver agenda →</a>
            </div>
          </div>

          <div className="float-y-3" style={{ height: '100%' }}>
            <div className="mod">
              <div className="mod-corner" style={{ background: 'var(--blue)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  <polyline points="17 8 21 12 17 16" /><line x1="13" y1="12" x2="21" y2="12" />
                </svg>
              </div>
              <h3 style={{ fontSize: '28px', margin: '8px 0 16px' }}>Buzón de Ideas</h3>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#666', fontWeight: 500, flex: 1 }}>
                ¿Tenés una propuesta para mejorar UBES? Subila, hacé que otros estudiantes la voten y llevala a asamblea oficial.
              </p>
              <Link
                to="/sugerencias"
                style={linkStyle}
                onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--blue)' }}
                onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
              >Proponer idea →</Link>
            </div>
          </div>

          <div className="float-y-2" style={{ height: '100%' }}>
            <div className="mod">
              <div className="mod-corner" style={{ background: 'var(--red)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3 style={{ fontSize: '28px', margin: '8px 0 16px' }}>Estatuto y Reglamentos</h3>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#666', fontWeight: 500, flex: 1 }}>
                Accedé al estatuto oficial, reglamentos técnicos de cada deporte, sanciones disciplinarias y actas de reuniones.
              </p>
              <a
                href="#"
                style={linkStyle}
                onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--red)' }}
                onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
              >Leer documentos →</a>
            </div>
          </div>
        </div>

        {/* 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} id="mod-row-2">

          <div className="float-y-4" style={{ height: '100%' }}>
            <div className="mod">
              <div className="mod-corner" style={{ background: 'var(--green)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0012 0V2z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '28px', margin: '8px 0 16px' }}>Intercolegiales</h3>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#666', fontWeight: 500, flex: 1 }}>
                Fixtures, resultados, tabla de posiciones y medallero general. Todo el seguimiento de los torneos en tiempo real, escuela por escuela.
              </p>
              <a
                href="#"
                style={linkStyle}
                onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#86EFAC' }}
                onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
              >Ver torneos →</a>
            </div>
          </div>

          <div className="float-y-1" style={{ height: '100%', animationDelay: '1.4s' }}>
            <div className="mod">
              <div className="mod-corner" style={{ background: 'var(--purple)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 6V2H8" /><path d="M21 13V8H8a4 4 0 100 8h13" /><path d="M2 22h20" />
                  <path d="M9 17.5V20" /><path d="M15 17.5V20" />
                </svg>
              </div>
              <h3 style={{ fontSize: '28px', margin: '8px 0 16px' }}>Históricos</h3>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#666', fontWeight: 500, flex: 1 }}>
                Recorré los años anteriores: ganadores, equipos legendarios, fotos de comisiones pasadas y el archivo completo de UBES.
              </p>
              <a
                href="#historicos"
                style={linkStyle}
                onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--purple)' }}
                onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
              >Ver archivo →</a>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
