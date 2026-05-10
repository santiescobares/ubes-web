import { AlertTriangle, X } from 'lucide-react'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmActionModal({ title, message, confirmLabel = 'Confirmar', danger = false, onConfirm, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <AlertTriangle size={15} style={{ color: danger ? 'var(--red-strong)' : 'var(--yellow)' }} />
            {title}
          </span>
          <button className="modal-close-btn" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body" style={{ padding: '14px 20px 20px' }}>
          <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5, margin: 0 }}>{message}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button
              className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
              onClick={() => { onConfirm(); onClose() }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
