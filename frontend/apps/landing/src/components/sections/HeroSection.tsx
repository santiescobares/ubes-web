import { useCarousel } from '@/hooks/useCarousel'
import img1  from '@/assets/home-1.jpeg'
import img2  from '@/assets/home-2.jpeg'
import img3  from '@/assets/home-3.jpeg'
import img4  from '@/assets/home-4.jpeg'
import img5  from '@/assets/home-5.jpeg'
import img6  from '@/assets/home-6.jpeg'
import img7  from '@/assets/home-7.jpeg'
import img8  from '@/assets/home-8.jpeg'

const CAROUSEL_ITEMS = [
  { img: img1, tilt: '-4deg', tapeColor: 'rgba(254,240,138,0.85)', tapeRot: '-3deg', label: '#Promo26' },
  { img: img2, tilt: '6deg',  tapeColor: 'rgba(196,181,253,0.85)', tapeRot: '4deg',  label: 'Hinchada' },
  { img: img3, tilt: '-6deg', tapeColor: 'rgba(254,202,202,0.85)', tapeRot: '8deg',  label: "Inter '25" },
  { img: img4, tilt: '3deg',  tapeColor: 'rgba(187,247,208,0.85)', tapeRot: '-5deg', label: 'Comisión' },
  { img: img5, tilt: '-3deg', tapeColor: 'rgba(191,219,254,0.85)', tapeRot: '6deg',  label: 'Asamblea' },
  { img: img6, tilt: '5deg',  tapeColor: 'rgba(254,240,138,0.85)', tapeRot: '-4deg', label: 'Monumento' },
  { img: img7, tilt: '-7deg', tapeColor: 'rgba(252,231,243,0.9)',  tapeRot: '7deg',  label: 'Festejo' },
  { img: img8, tilt: '4deg',  tapeColor: 'rgba(187,247,208,0.85)', tapeRot: '-6deg', label: 'Mate ☕' },
]

export default function HeroSection() {
  const { getItemPosition } = useCarousel(CAROUSEL_ITEMS.length, 200)

  return (
    <main id="inicio" style={{ position: 'relative', zIndex: 1, padding: '160px 0 100px' }}>
      <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '64px', alignItems: 'center' }} id="hero-grid">

        {/* Text */}
        <div id="hero-text" style={{ position: 'relative', zIndex: 10, maxWidth: '640px' }}>
          <h1 className="fade-up" style={{
            fontSize: 'clamp(80px,11vw,144px)',
            fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 0.85,
            color: 'var(--ink)', marginBottom: '8px',
          }}>
            UBES<span style={{ color: '#FACC15' }}>.</span>
          </h1>

          <h2 className="fade-up d1" style={{
            fontSize: 'clamp(20px,2.6vw,30px)',
            fontWeight: 900, lineHeight: 1.18,
            textTransform: 'uppercase', color: '#2D2D2D', marginBottom: '32px',
          }}>
            Unión Bellvillense de<br />
            <span className="hl">Estudiantes Secundarios</span>
          </h2>

          <p className="fade-up d2" style={{
            fontSize: 'clamp(16px,1.7vw,20px)', lineHeight: 1.65,
            color: '#666', maxWidth: '540px', marginBottom: '36px', fontWeight: 500,
          }}>
            El punto de encuentro de las escuelas de Bell Ville. Enterate de los torneos, proponé ideas, consultá la agenda y representá a tu colegio.
          </p>

          <div className="fade-up d3" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            <a href="#informacion" className="btn btn-y-shadow">
              Ver Intercolegiales
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0012 0V2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Visual: circular polaroid carousel */}
        <div className="hide-md" style={{ position: 'relative', height: '560px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Center yellow stamp */}
          <div style={{
            position: 'absolute', width: '140px', height: '140px', borderRadius: '50%',
            background: 'var(--yellow)', border: '3px solid var(--ink)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-head)', fontWeight: 900, color: 'var(--ink)',
            boxShadow: '6px 6px 0 var(--ink)', zIndex: 5, transform: 'rotate(-8deg)',
            textAlign: 'center', lineHeight: 0.95,
          }}>
            <div style={{ fontSize: '36px', letterSpacing: '-0.04em' }}>UBES</div>
            <div style={{ fontSize: '11px', letterSpacing: '0.18em', marginTop: '4px' }}>// 1995</div>
          </div>

          {/* Rotating track */}
          <div className="carousel-track" style={{ position: 'relative', width: '480px', height: '480px' }}>
            {CAROUSEL_ITEMS.map((item, i) => {
              const { x, y } = getItemPosition(i)
              return (
                <div
                  key={i}
                  className="carousel-spoke"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                  <div className="carousel-item">
                    <div className="polaroid polaroid-c" style={{ ['--tilt' as string]: item.tilt }}>
                      <img src={item.img} alt="" style={{ height: '120px' }} />
                      <div className="tape" style={{ top: '-10px', left: '50%', marginLeft: '-26px', background: item.tapeColor, transform: `rotate(${item.tapeRot})` }} />
                      <div style={{ fontFamily: 'var(--font-mono)', fontStyle: 'italic', fontWeight: 700, fontSize: '12px', color: '#444', marginTop: '8px', textAlign: 'center' }}>{item.label}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </main>
  )
}
