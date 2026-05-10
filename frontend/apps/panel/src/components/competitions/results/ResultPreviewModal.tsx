import { Pencil, X } from 'lucide-react'
import { POSITION_TYPE_LABELS, SCHOOL_LABELS } from '@/lib/labels'
import { ParticipantPositionType } from '@ubes/types'
import type { ResultDTO } from '@ubes/types'

interface Props {
  result: ResultDTO
  onClose: () => void
  onEdit: () => void
}

export default function ResultPreviewModal({ result, onClose, onEdit }: Props) {
  const { positionType, positionNumber, name, participant } = result

  const schoolLabel = participant !== null
    ? SCHOOL_LABELS[participant.school]
    : positionType !== ParticipantPositionType.INDIVIDUAL
      ? name || '—'
      : '—'

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">
            Puesto #{positionNumber} - {POSITION_TYPE_LABELS[positionType]}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="modal-close-btn" onClick={onEdit} title="Editar">
              <Pencil size={14} />
            </button>
            <button className="modal-close-btn" onClick={onClose} title="Cerrar">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-row">
            <div className="form-field">
              <span className="form-label">Nombre</span>
              <div className="preview-value">{name || '—'}</div>
            </div>
            <div className="form-field">
              <span className="form-label">Escuela</span>
              <div className="preview-value">{schoolLabel}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
