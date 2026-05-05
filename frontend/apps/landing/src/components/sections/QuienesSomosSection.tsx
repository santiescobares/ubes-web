export default function QuienesSomosSection() {
  return (
    <section style={{ padding: '96px 0', position: 'relative', zIndex: 1 }} id="quienes-somos">
      <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '56px', alignItems: 'center' }} id="qs-grid">

        {/* Text */}
        <div>
          <h2 style={{ fontSize: 'clamp(36px,5vw,56px)', textTransform: 'uppercase', marginBottom: '20px' }}>¿Quiénes somos?</h2>
          <div style={{ width: '64px', height: '8px', background: 'var(--yellow)', border: '2px solid var(--ink)', transform: 'rotate(-1deg)', marginBottom: '32px' }} />
          <p style={{ fontSize: '17px', lineHeight: 1.75, color: '#666', fontWeight: 500, marginBottom: '18px', maxWidth: '520px' }}>
            UBES es la organización que cada año reúne a los estudiantes secundarios de Bell Ville. Una comisión directiva elegida democráticamente se encarga de organizar todo: torneos intercolegiales, eventos culturales, fiestas y el esperado baile de egreso.
          </p>
          <p style={{ fontSize: '17px', lineHeight: 1.75, color: '#666', fontWeight: 500, maxWidth: '520px' }}>
            Esta plataforma nace para hacer todo eso más simple: gestionar participantes, competencias y resultados — sin papelerío, sin demoras, sin complicaciones.
          </p>
        </div>

        {/* Action cards — wrapper div carries float, button carries the rest */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          <div className="float-y-1">
            <button className="action">
              <div className="action-icon" style={{ background: 'var(--blue)', transform: 'rotate(-3deg)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '19px', textTransform: 'uppercase' }}>Conocer a la comisión</div>
                <div style={{ color: '#888', fontWeight: 600, fontSize: '13px', marginTop: '3px' }}>Ver la lista de integrantes de este año</div>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>

          <div className="float-y-2">
            <button className="action">
              <div className="action-icon" style={{ background: 'var(--pink)', transform: 'rotate(2deg)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '19px', textTransform: 'uppercase' }}>Redes Sociales</div>
                <div style={{ color: '#888', fontWeight: 600, fontSize: '13px', marginTop: '3px' }}>Seguinos en Instagram y enterate de todo</div>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>

          <div className="float-y-4">
            <button className="action">
              <div className="action-icon" style={{ background: 'var(--yellow)', transform: 'rotate(-1deg)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '19px', textTransform: 'uppercase' }}>Contactar dudas</div>
                <div style={{ color: '#888', fontWeight: 600, fontSize: '13px', marginTop: '3px' }}>Escribinos y te respondemos a la brevedad</div>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}
