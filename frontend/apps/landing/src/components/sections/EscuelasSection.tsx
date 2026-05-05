const SCHOOLS = [
  { num: '// 01', name: 'Normal',         sub: 'Escuela Normal Superior', bg: '#FEF3C7' },
  { num: '// 02', name: 'Huerto',         sub: 'Colegio del Huerto',       bg: '#DBEAFE' },
  { num: '// 03', name: 'San José',       sub: 'Colegio San José',         bg: '#FCE7F3' },
  { num: '// 04', name: 'IPET 267',       sub: 'Instituto Técnico',        bg: '#DCFCE7' },
  { num: '// 05', name: 'Comercio',       sub: 'Escuela de Comercio',      bg: '#FED7AA' },
  { num: '// 06', name: 'Agrotécnica',    sub: 'Esc. Agrotécnica',         bg: '#E9D5FF' },
  { num: '// 07', name: 'Ex Nacional',    sub: 'IPEM Ex Nacional',         bg: '#FECACA' },
  { num: '// 08', name: 'San Antonio',    sub: 'Inst. San Antonio',        bg: '#FEF9C3' },
  { num: '// 09', name: 'IPEM 148',       sub: 'IPEM Nº 148',              bg: '#CFFAFE' },
  { num: '// 10', name: 'Belgrano',       sub: 'Inst. Manuel Belgrano',    bg: '#FFE4E6' },
  { num: '// 11', name: 'CENMA',          sub: 'CENMA Bell Ville',         bg: '#FEF3C7' },
  { num: '// 12', name: 'Sagrada Familia',sub: 'Inst. Sagrada Familia',    bg: '#E0E7FF' },
]

export default function EscuelasSection() {
  return (
    <section id="escuelas" style={{ padding: '88px 0', background: 'var(--bg)', borderBottom: '2px solid var(--ink)', position: 'relative', zIndex: 1 }}>
      <div className="wrap">

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', marginBottom: '48px' }}>
          <div>
            <span className="badge-tilt" style={{ background: 'var(--blue)' }}>Escuelas</span>
            <h2 style={{ fontSize: 'clamp(32px,4.5vw,52px)', textTransform: 'uppercase', marginTop: '18px', lineHeight: 1 }}>
              Las escuelas de Bell Ville,<br />
              <span className="hl hl-y">unidas en UBES</span>
            </h2>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'white', border: '2px solid var(--ink)', padding: '8px 14px', boxShadow: 'var(--shadow)' }}>
            7 colegios · 1 comunidad
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '18px' }} id="schools-grid">
          {SCHOOLS.map(school => (
            <div key={school.name} className="school" style={{ background: school.bg }}>
              <span className="school-num">{school.num}</span>
              <div>
                <div className="school-name">{school.name}</div>
                <div className="school-sub">{school.sub}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
