export default function CalendarioSection() {
  const moreLinkBase = {
    marginTop: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px',
    fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '13px',
    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
    textDecoration: 'none', transition: 'color 0.15s',
  }

  const EVENTS = [
    { month: 'OCT', day: '18', title: 'Apertura Torneo de Fútbol', desc: 'Inicio oficial del torneo masculino y femenino. Todos los equipos deben presentar planteles confirmados.', time: '09:00 hs', place: 'Estadio Municipal' },
    { month: 'OCT', day: '24', title: 'Cierre de listas: Handball', desc: 'Límite para cargar fichas médicas y alumnos regulares en el sistema.', time: '23:59 hs', place: 'Plataforma Web' },
    { month: 'NOV', day: '05', title: 'Asamblea General de Delegados', desc: 'Votación de sugerencias comunitarias y revisión de sanciones.', time: '19:30 hs', place: 'Sede UBES' },
    { month: 'NOV', day: '22', title: 'Baile de Egreso 2026', desc: 'El evento más esperado del año. Inscripción abierta para egresados.', time: '21:00 hs', place: 'Por confirmar' },
  ]

  const ANNOUNCEMENTS = [
    {
      tag: 'Comunicado Oficial', tagStyle: { color: '#1d4ed8', background: '#DBEAFE', borderColor: '#93C5FD' },
      title: 'Actualización del Reglamento Deportivo',
      body: 'Ya se encuentra publicado el documento PDF con los cambios aprobados en la última asamblea respecto a las sanciones en voley y fútbol.',
      time: 'Hace 2 horas', highlight: true,
    },
    {
      tag: 'Resultados', tagStyle: { color: '#15803d', background: '#DCFCE7', borderColor: '#86EFAC' },
      title: '¡Finalizó la jornada de Atletismo!',
      body: 'Felicitamos a todos los participantes. Ya están cargados los puntajes oficiales y la tabla general de posiciones actualizada.',
      time: 'Ayer, 20:15 hs', highlight: false,
    },
    {
      tag: 'Convocatoria', tagStyle: { color: '#92400e', background: '#FEF3C7', borderColor: '#FCD34D' },
      title: 'Inscripción abierta — Torneo de Básquet',
      body: 'Los delegados deben cargar los planteles antes del 28 de octubre. Máximo 12 jugadores por equipo.',
      time: 'Hace 3 días', highlight: false,
    },
  ]

  return (
    <section style={{ padding: '88px 0', position: 'relative', zIndex: 1 }} id="calendario">
      <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '64px' }} id="cn-grid">

        {/* ── Eventos ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            {/* Icon wrapper carries float, inner div carries rotation */}
            <div className="float-y-1">
              <div style={{
                width: '48px', height: '48px', background: 'var(--red-strong)', border: '2px solid var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow)', transform: 'rotate(3deg)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', textTransform: 'uppercase' }}>Próximos Eventos</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {EVENTS.map(ev => (
              <div className="event" key={ev.title}>
                <div className="event-date">
                  <span className="month">{ev.month}</span>
                  <span className="day">{ev.day}</span>
                </div>
                <div style={{ padding: '12px 18px', flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '16px', marginBottom: '3px' }}>{ev.title}</div>
                  <div style={{ fontSize: '12px', color: '#666', fontWeight: 500, lineHeight: 1.5, marginBottom: '7px' }}>{ev.desc}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: '#888', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      {ev.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      {ev.place}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <a
            href="#"
            style={{ ...moreLinkBase, color: 'var(--red-strong)' }}
            onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)' }}
            onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--red-strong)' }}
          >Ver calendario completo →</a>
        </div>

        {/* ── Anuncios ── */}
        <div id="novedades">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            {/* Icon wrapper carries float, inner div carries rotation */}
            <div className="float-y-3">
              <div style={{
                width: '48px', height: '48px', background: 'var(--blue-strong)', border: '2px solid var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow)', transform: 'rotate(-3deg)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 11-5.8-1.6" />
                </svg>
              </div>
            </div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', textTransform: 'uppercase' }}>Últimos Anuncios</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {ANNOUNCEMENTS.map(ann => (
              <div className="anuncio" key={ann.title}>
                {ann.highlight && (
                  <div style={{ position: 'absolute', top: '-12px', right: '-12px', width: '32px', height: '32px', background: 'var(--yellow)', border: '2px solid var(--ink)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '16px' }} className="bounce">!</div>
                )}
                <span className="tag" style={ann.tagStyle}>{ann.tag}</span>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '19px', marginBottom: '6px', lineHeight: 1.25 }}>{ann.title}</div>
                <p style={{ fontSize: '14px', color: '#666', fontWeight: 500, lineHeight: 1.6, marginBottom: '14px' }}>{ann.body}</p>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#aaa', fontWeight: 700 }}>{ann.time}</span>
              </div>
            ))}
          </div>

          <a
            href="#"
            style={{ ...moreLinkBase, color: 'var(--blue-strong)' }}
            onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)' }}
            onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--blue-strong)' }}
          >Ver todas las novedades →</a>
        </div>

      </div>
    </section>
  )
}
