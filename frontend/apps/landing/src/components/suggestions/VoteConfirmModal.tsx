import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ThumbsUp, ThumbsDown } from 'lucide-react'

interface VoteConfirmModalProps {
  inFavor: boolean
  loading: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function VoteConfirmModal({ inFavor, loading, onConfirm, onClose }: VoteConfirmModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        className="suggestion-confirm-modal"
        style={{
          background: 'var(--bg)',
          border: '2px solid var(--ink)',
          boxShadow: 'var(--shadow-lg)',
          padding: '28px 24px 24px',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            width: '28px', height: '28px',
            background: 'var(--ink)', color: 'white',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Cerrar"
        >
          <X size={14} />
        </button>

        <p style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '18px', marginBottom: '10px', paddingRight: '32px' }}>
          ¿Confirmás tu voto?
        </p>
        <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.55, marginBottom: '20px' }}>
          Vas a votar <strong>{inFavor ? 'a favor' : 'en contra'}</strong>. Esta acción no se puede deshacer.
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className={`suggestion-vote-btn ${inFavor ? 'suggestion-vote-btn-like' : 'suggestion-vote-btn-dislike'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {inFavor ? <ThumbsUp size={15} /> : <ThumbsDown size={15} />}
            {loading ? 'Enviando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
