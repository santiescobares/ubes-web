import { Pencil, X, ExternalLink } from 'lucide-react'
import { SCHOOL_LABELS, PARTICIPANT_ROLE_LABELS, ID_TYPE_LABELS } from '@/lib/labels'
import type { ParticipantDTO } from '@ubes/types'

interface Props {
  participant: ParticipantDTO
  requiresShirtNumbers: boolean
  onEdit: () => void
  onClose: () => void
}

export default function ParticipantViewModal({ participant, requiresShirtNumbers, onEdit, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">Participante</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="action-btn" title="Editar" onClick={onEdit}>
              <Pencil size={14} />
            </button>
            <button className="modal-close-btn" title="Cerrar" onClick={onClose}>
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-row">
            <div className="detail-field">
              <span className="detail-field-label">Nombre</span>
              <div className="detail-field-value">{participant.firstName}</div>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Apellido</span>
              <div className="detail-field-value">{participant.lastName}</div>
            </div>
          </div>

          <div className="form-row">
            <div className="detail-field">
              <span className="detail-field-label">Tipo de doc.</span>
              <div className="detail-field-value">{ID_TYPE_LABELS[participant.idType]}</div>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Nº Documento</span>
              <div className="detail-field-value">{participant.idNumber}</div>
            </div>
          </div>

          <div className="form-row">
            <div className="detail-field">
              <span className="detail-field-label">Escuela</span>
              <div className="detail-field-value">{SCHOOL_LABELS[participant.school]}</div>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Rol</span>
              <div className="detail-field-value">{PARTICIPANT_ROLE_LABELS[participant.role]}</div>
            </div>
          </div>

          {requiresShirtNumbers && (
            <div className="detail-field">
              <span className="detail-field-label">Nº Camiseta</span>
              <div className="detail-field-value">{participant.shirtNumber || '—'}</div>
            </div>
          )}

          <div className="cert-row">
            <span className="cert-label">Cert. Alumno Reg.</span>
            {participant.studentCertificateURL ? (
              <a href={participant.studentCertificateURL} target="_blank" rel="noopener noreferrer"
                className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>
                Ver <ExternalLink size={11} />
              </a>
            ) : (
              <span className="cert-status">Vacío</span>
            )}
          </div>

          <div className="cert-row">
            <span className="cert-label">Ficha Médica</span>
            {participant.medicalCertificateURL ? (
              <a href={participant.medicalCertificateURL} target="_blank" rel="noopener noreferrer"
                className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>
                Ver <ExternalLink size={11} />
              </a>
            ) : (
              <span className="cert-status">Vacío</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
