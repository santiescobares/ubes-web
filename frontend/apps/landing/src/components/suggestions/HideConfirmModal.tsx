import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, EyeOff, Eye } from 'lucide-react'

interface HideConfirmModalProps {
  hiding: boolean
  loading: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function HideConfirmModal({ hiding, loading, onConfirm, onClose }: HideConfirmModalProps) {
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
          {hiding ? '¿Ocultar sugerencia?' : '¿Restaurar sugerencia?'}
        </p>
        <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.55, marginBottom: '20px' }}>
          {hiding
            ? 'La sugerencia dejará de ser visible para los usuarios. Solo los executives podrán verla.'
            : 'La sugerencia volverá a ser visible para todos los usuarios.'}
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="btn"
            onClick={onConfirm}
            disabled={loading}
            style={{ fontSize: '14px', padding: '10px 18px', gap: '6px' }}
          >
            {hiding ? <EyeOff size={15} /> : <Eye size={15} />}
            {loading ? 'Procesando…' : hiding ? 'Ocultar' : 'Restaurar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
