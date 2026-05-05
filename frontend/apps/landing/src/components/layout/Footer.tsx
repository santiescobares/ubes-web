import logoImg from '@/assets/logo.png'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', color: 'white', padding: '80px 0 32px', borderTop: '2px solid var(--ink)', position: 'relative', zIndex: 1 }}>
      <div className="wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px', marginBottom: '56px' }} id="footer-grid">

          <div id="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <img src={logoImg} alt="UBES" style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
              <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '44px', letterSpacing: '-0.04em', color: 'white' }}>
                UBES<span style={{ color: 'var(--yellow)' }}>.</span>
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: 500, lineHeight: 1.7, maxWidth: '300px' }}>
              Unión Bellvillense de Estudiantes Secundarios.<br />
              Gestionado por y para la comunidad estudiantil.
            </p>
          </div>

          <div id="footer-links" style={{ display: 'flex', flexWrap: 'wrap', gap: '48px' }}>
            <div>
              <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'white', marginBottom: '18px', paddingBottom: '6px', borderBottom: '2px solid rgba(255,255,255,0.15)', display: 'inline-block' }}>Plataforma</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '11px' }}>
                {['Intercolegiales', 'Documentos Oficiales', 'Buzón de Sugerencias', 'Histórico (años anteriores)'].map(item => (
                  <li key={item}>
                    <a
                      href="#"
                      style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 500, transition: 'color 0.15s' }}
                      onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--yellow)' }}
                      onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)' }}
                    >{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'white', marginBottom: '18px', paddingBottom: '6px', borderBottom: '2px solid rgba(255,255,255,0.15)', display: 'inline-block' }}>Acceso Institucional</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '11px' }}>
                <li>
                  <a
                    href="#"
                    style={{ textDecoration: 'none', color: 'var(--yellow)', fontSize: '14px', fontWeight: 900, transition: 'color 0.15s' }}
                    onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'white' }}
                    onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--yellow)' }}
                  >Login para Delegados →</a>
                </li>
                {['Guía de uso', 'Soporte Técnico'].map(item => (
                  <li key={item}>
                    <a
                      href="#"
                      style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 500, transition: 'color 0.15s' }}
                      onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--yellow)' }}
                      onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)' }}
                    >{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div id="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Plataforma Oficial © 2026</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hecho en Bell Ville, Córdoba.</p>
        </div>
      </div>
    </footer>
  )
}
