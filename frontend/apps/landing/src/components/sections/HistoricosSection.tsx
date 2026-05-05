import img9  from '@/assets/home-9.jpeg'
import img10 from '@/assets/home-10.jpg'
import img11 from '@/assets/home-11.jpg'
import img12 from '@/assets/home-12.jpg'

export default function HistoricosSection() {
  const btnStyle: React.CSSProperties = {
    marginTop: '32px', display: 'inline-flex', alignItems: 'center', gap: '10px',
    fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '14px',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    color: 'var(--ink)', textDecoration: 'none',
    background: 'var(--yellow)', border: '2px solid var(--yellow)',
    padding: '14px 24px', boxShadow: '6px 6px 0 white', transition: 'all 0.15s',
  }

  return (
    <section id="historicos" style={{ position: 'relative', zIndex: 1, padding: '80px 0', borderTop: '2px solid var(--ink)', background: 'var(--ink)', overflow: 'hidden' }}>
      {/* Decorative grid on dark */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.06, backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="wrap" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr', gap: '48px', alignItems: 'center' }} id="hist-grid">

        {/* Text */}
        <div style={{ color: 'white', position: 'relative' }}>
          <div className="badge-float-lr" style={{ display: 'inline-block', marginBottom: '24px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontFamily: 'var(--font-head)', fontSize: '11px', fontWeight: 900,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              border: '2px solid var(--yellow)', background: 'transparent', color: 'var(--yellow)',
              padding: '5px 12px', transform: 'rotate(-1.5deg)',
            }}>
              <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--yellow)' }} />
              Histórico UBES
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(40px,6vw,80px)', textTransform: 'uppercase', lineHeight: 0.92, color: 'white', marginBottom: '24px' }}>
            Más de <span style={{ color: 'var(--yellow)' }}>30 años</span><br />
            haciendo historia
          </h2>

          <p style={{ fontSize: '17px', lineHeight: 1.65, color: 'rgba(255,255,255,0.65)', maxWidth: '480px', fontWeight: 500, marginBottom: '32px' }}>
            Generaciones enteras de estudiantes pasaron por UBES. Acá quedan las fotos, los campeones, las comisiones y los momentos que marcaron a Bell Ville.
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0, border: '2px solid var(--yellow)', background: 'rgba(0,0,0,0.4)' }}>
            {[
              { value: '7+', label: 'Escuelas' },
              { value: '10+', label: 'Disciplinas' },
              { value: '2k+', label: 'Estudiantes' },
            ].map((stat, i) => (
              <div key={stat.label} style={{ padding: '20px 16px', borderRight: i < 2 ? '2px solid var(--yellow)' : undefined, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: '36px', fontWeight: 900, color: 'var(--yellow)', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '6px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <a
            href="#"
            style={btnStyle}
            onMouseOver={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translate(6px,6px)'; el.style.boxShadow = '0 0 0 white' }}
            onMouseOut={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translate(0,0)'; el.style.boxShadow = '6px 6px 0 white' }}
          >
            Recorrer el archivo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </a>
        </div>

        {/* Photos collage — each photo wrapped for float animation, rotation on inner polaroid */}
        <div style={{ position: 'relative', height: '480px', width: '100%' }}>
          <div className="sticker" style={{ top: '-10px', left: '50%', transform: 'translateX(-50%) rotate(-3deg)', background: 'var(--yellow)', color: 'var(--ink)', zIndex: 50 }}>UBES · BELL VILLE</div>

          {/* Photo 1 — floats up/down */}
          <div className="float-y-1" style={{ position: 'absolute', top: '30px', left: 0, width: '280px', zIndex: 20 }}>
            <div className="polaroid" style={{ transform: 'rotate(-4deg)' }}>
              <img src={img9} alt="" style={{ height: '200px' }} />
              <div className="tape" style={{ top: '-10px', left: '30%', background: 'rgba(254,240,138,0.9)', transform: 'rotate(-2deg)' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontStyle: 'italic', fontWeight: 700, fontSize: '13px', color: '#444', marginTop: '8px' }}>Final · 2024</div>
            </div>
          </div>

          {/* Photo 2 — floats diagonally right */}
          <div className="float-y-2" style={{ position: 'absolute', top: '60px', right: '20px', width: '240px', zIndex: 30 }}>
            <div className="polaroid" style={{ transform: 'rotate(5deg)' }}>
              <img src={img10} alt="" style={{ height: '160px' }} />
              <div className="tape" style={{ top: '-10px', right: '25%', background: 'rgba(196,181,253,0.85)', transform: 'rotate(8deg)' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontStyle: 'italic', fontWeight: 700, fontSize: '13px', color: '#444', marginTop: '8px' }}>La hinchada</div>
            </div>
          </div>

          {/* Photo 3 — floats diagonally left */}
          <div className="float-y-3" style={{ position: 'absolute', bottom: 0, left: '60px', width: '220px', zIndex: 25 }}>
            <div className="polaroid" style={{ transform: 'rotate(3deg)' }}>
              <img src={img11} alt="" style={{ height: '150px' }} />
              <div className="tape" style={{ top: '-10px', left: '50%', marginLeft: '-30px', background: 'rgba(254,202,202,0.85)', transform: 'rotate(-4deg)' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontStyle: 'italic', fontWeight: 700, fontSize: '13px', color: '#444', marginTop: '8px' }}>El monumento</div>
            </div>
          </div>

          {/* Photo 4 — floats up/down subtle (hidden on mobile) */}
          <div className="float-y-4 hist-photo-4" style={{ position: 'absolute', bottom: '30px', right: '50px', width: '200px', zIndex: 15 }}>
            <div className="polaroid" style={{ transform: 'rotate(-6deg)' }}>
              <img src={img12} alt="" style={{ height: '140px' }} />
              <div className="tape" style={{ top: '-10px', left: '25%', background: 'rgba(187,247,208,0.85)', transform: 'rotate(6deg)' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontStyle: 'italic', fontWeight: 700, fontSize: '13px', color: '#444', marginTop: '8px' }}>Comisión '23</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
