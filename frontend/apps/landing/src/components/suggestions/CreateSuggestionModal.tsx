import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Send } from 'lucide-react'
import { toast } from 'sonner'
import type { SuggestionDTO } from '@ubes/types'
import { createSuggestion } from '@/services/suggestionService'

interface CreateSuggestionModalProps {
  onClose: () => void
  onCreate: (suggestion: SuggestionDTO) => void
}

const MIN = 10
const MAX = 1000

export default function CreateSuggestionModal({ onClose, onCreate }: CreateSuggestionModalProps) {
  const [content, setContent] = useState('')
  const [anonymized, setAnonymized] = useState(false)
  const [loading, setLoading] = useState(false)

  const len = content.trim().length
  const valid = len >= MIN && len <= MAX

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit() {
    if (!valid || loading) return
    setLoading(true)
    try {
      const s = await createSuggestion({ content: content.trim(), anonymized })
      toast.success('Sugerencia publicada')
      onCreate(s)
      onClose()
    } catch {
      toast.error('No se pudo publicar la sugerencia')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(520px, 92vw)',
          border: '2px solid var(--ink)',
          borderLeft: '6px solid var(--yellow)',
          boxShadow: 'var(--shadow-lg)',
          background: 'var(--bg)',
          padding: '28px 28px 24px',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            width: '32px', height: '32px',
            background: 'var(--ink)', color: 'white',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>

        <p style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '22px', marginBottom: '20px', paddingRight: '40px' }}>
          Nueva sugerencia
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea
            className={`create-suggestion-textarea${!valid && len > 0 ? ' create-suggestion-textarea--error' : ''}`}
            placeholder="Escribí tu idea o sugerencia para UBES…"
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={MAX}
            autoFocus
          />

          <p className={`create-suggestion-char-count${len > MAX ? ' create-suggestion-char-count--warn' : ''}`}>
            {len}/{MAX}
            {len > 0 && len < MIN && <span style={{ marginLeft: '8px', color: 'var(--red-strong)' }}>Mínimo {MIN} caracteres</span>}
          </p>

          <div className="suggestion-anon-switch">
            <div className="suggestion-anon-switch-label">
              <p style={{ margin: 0 }}>Enviar como anónimo</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#888', fontWeight: 400 }}>
                Tu nombre no será visible para otros usuarios
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={anonymized}
              className={`suggestion-toggle${anonymized ? ' suggestion-toggle--on' : ''}`}
              onClick={() => setAnonymized(v => !v)}
            >
              <span className="suggestion-toggle-thumb" />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button className="btn-ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button
              className="btn"
              onClick={handleSubmit}
              disabled={!valid || loading}
              style={{ gap: '6px', fontSize: '14px', padding: '10px 20px' }}
            >
              <Send size={15} />
              {loading ? 'Publicando…' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
