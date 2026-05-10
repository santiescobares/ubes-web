import { Pencil, X } from 'lucide-react'
import { PARTICIPANT_ROLE_LABELS, SCHOOL_LABELS, ID_TYPE_LABELS } from '@/lib/labels'
import type { ParticipantDTO, CompetitionDTO } from '@ubes/types'

interface Props {
  participant: ParticipantDTO
  competition: CompetitionDTO
  onClose: () => void
  onEdit: () => void
}

export default function ParticipantPreviewModal({ participant, competition, onClose, onEdit }: Props) {
  const { firstName, lastName, idType, idNumber, school, role, shirtNumber } = participant
  const showShirt = competition.requiresShirtNumbers

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">Información de Participante</span>
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
              <div className="preview-value">{firstName}</div>
            </div>
            <div className="form-field">
              <span className="form-label">Apellido</span>
              <div className="preview-value">{lastName}</div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <span className="form-label">Nº Documento</span>
              <div className="preview-value">{idNumber}</div>
            </div>
            <div className="form-field">
              <span className="form-label">Tipo Documento</span>
              <div className="preview-value">{ID_TYPE_LABELS[idType]}</div>
            </div>
          </div>

          <div className="form-row" style={{ gridTemplateColumns: showShirt ? '1fr 1fr 1fr' : '1fr 1fr' }}>
            <div className="form-field">
              <span className="form-label">Escuela</span>
              <div className="preview-value">{SCHOOL_LABELS[school]}</div>
            </div>
            <div className="form-field">
              <span className="form-label">Rol</span>
              <div className="preview-value">{PARTICIPANT_ROLE_LABELS[role]}</div>
            </div>
            {showShirt && (
              <div className="form-field">
                <span className="form-label">Nº Camiseta</span>
                <div className="preview-value">{shirtNumber ?? '—'}</div>
              </div>
            )}
          </div>

          <div className="form-row">
            <CertificateField label="Cert. Alumno Reg." url={participant.studentCertificateURL} />
            {competition.requiresMedicalCertificates && (
              <CertificateField label="Ficha Médica" url={participant.medicalCertificateURL} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CertificateField({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="form-field">
      <span className="form-label">{label}</span>
      {url ? (
        <button
          className="form-input"
          style={{ textAlign: 'center', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 12 }}
          onClick={() => window.open(url, '_blank')}
        >
          Ver
        </button>
      ) : (
        <div className="preview-value" style={{ color: 'var(--muted)', fontSize: 12 }}>Vacío</div>
      )}
    </div>
  )
}
