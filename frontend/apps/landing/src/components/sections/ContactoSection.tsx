export default function ContactoSection() {
  return (
    <section id="contacto" style={{ padding: '96px 0', position: 'relative', zIndex: 1 }}>
      <div className="wrap">
        <div style={{
          border: '2px solid var(--ink)', boxShadow: 'var(--shadow-lg)',
          background: 'var(--bg)', padding: '64px 32px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative corner stickers — wrapper handles float, inner span handles rotation */}
          <div className="hide-md badge-float-lr" style={{ position: 'absolute', top: '24px', left: '24px' }}>
            <div className="sticker" style={{ position: 'static', background: 'var(--yellow)', color: 'var(--ink)', transform: 'rotate(-6deg)' }}>¡Hola!</div>
          </div>
          <div className="hide-md badge-float-rl" style={{ position: 'absolute', top: '24px', right: '24px' }}>
            <div className="sticker" style={{ position: 'static', background: 'var(--blue)', color: 'var(--ink)', transform: 'rotate(4deg)' }}>📍 Bell Ville</div>
          </div>

          <span className="badge-tilt" style={{ background: 'var(--pink)', marginBottom: '24px' }}>Contacto</span>

          <h2 style={{ fontSize: 'clamp(32px,5vw,56px)', textTransform: 'uppercase', lineHeight: 1, maxWidth: '700px', margin: '24px auto 16px' }}>
            ¿Tenés dudas o querés <span className="hl hl-y">participar?</span>
          </h2>

          <p style={{ fontSize: '17px', lineHeight: 1.65, color: '#666', fontWeight: 500, maxWidth: '520px', margin: '0 auto 36px' }}>
            Si sos delegado, representante de tu escuela o simplemente querés saber más, escribinos. La comisión te responde rapidísimo.
          </p>

          <div id="contacto-btns" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px' }}>
            <div className="float-y-1">
              <a href="mailto:ubes@bellville.edu.ar" className="btn btn-y-shadow" style={{ background: 'var(--ink)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                Mail
              </a>
            </div>
            <div className="float-y-2">
              <a href="https://instagram.com/ubes.bellville" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ background: 'white' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                Instagram
              </a>
            </div>
            <div className="float-y-3">
              <a href="https://twitter.com/ubes_bellville" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ background: 'white' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </a>
            </div>
            <div className="float-y-4">
              <a href="https://facebook.com/ubes.bellville" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ background: 'white' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </a>
            </div>
          </div>


        </div>
      </div>
    </section>
  )
}
