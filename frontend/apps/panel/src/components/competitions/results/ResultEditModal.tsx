import { useState } from 'react'
import { Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { POSITION_TYPE_LABELS, SCHOOL_LABELS } from '@/lib/labels'
import { ResultService } from '@/services/competition.service'
import { ParticipantPositionType, School } from '@ubes/types'
import type { ResultDTO, ParticipantDTO } from '@ubes/types'

interface Props {
  competitionId: string
  result: ResultDTO
  participants: ParticipantDTO[]
  onClose: () => void
  onSaved: () => void
}

const SCHOOL_OPTIONS = Object.entries(SCHOOL_LABELS) as [School, string][]

export default function ResultEditModal({ competitionId, result, participants, onClose, onSaved }: Props) {
  const isIndividual = result.positionType === ParticipantPositionType.INDIVIDUAL

  const [name, setName] = useState(result.name || '')
  const [selectedParticipantId, setSelectedParticipantId] = useState(result.participant?.id ?? '')
  const [selectedSchool, setSelectedSchool] = useState<School | ''>(
    !isIndividual && result.participant ? result.participant.school : ''
  )
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      const dto = isIndividual
        ? { participantId: selectedParticipantId || undefined, removeParticipant: !selectedParticipantId }
        : { name: name || undefined }
      await ResultService.updateResult(competitionId, result.positionType, result.positionNumber, dto)
      toast.success('Resultado actualizado')
      onSaved()
    } catch {
      toast.error('Error al guardar el resultado.')
    } finally {
      setLoading(false)
    }
  }

  async function handleClear() {
    setLoading(true)
    try {
      await ResultService.updateResult(competitionId, result.positionType, result.positionNumber, {
        removeParticipant: true,
        name: undefined,
      })
      toast.success('Resultado actualizado')
      onSaved()
    } catch {
      toast.error('Error al limpiar el resultado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">
            Puesto #{result.positionNumber} - {POSITION_TYPE_LABELS[result.positionType]}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {!confirmDelete && (
              <button className="modal-close-btn" onClick={() => setConfirmDelete(true)} title="Limpiar resultado">
                <Trash2 size={14} />
              </button>
            )}
            <button className="modal-close-btn" onClick={onClose} title="Cerrar">
              <X size={15} />
            </button>
          </div>
        </div>

        {confirmDelete ? (
          <div style={{ padding: '8px 0' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 12px' }}>
              ¿Limpiar este resultado? Se eliminará la asignación actual.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)} disabled={loading}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleClear} disabled={loading}>
                {loading ? 'Limpiando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="form-grid">
              <div className="form-row" style={{ gridTemplateColumns: '48px 1fr 1fr' }}>
                <div className="form-field">
                  <span className="form-label">#</span>
                  <div className="preview-value" style={{ fontWeight: 600 }}>
                    {result.positionNumber}
                  </div>
                </div>

                {isIndividual ? (
                  <>
                    <div className="form-field">
                      <span className="form-label">Escuela</span>
                      <div className="preview-value" style={{ color: 'var(--muted)' }}>
                        {result.participant ? SCHOOL_LABELS[result.participant.school] : '—'}
                      </div>
                    </div>
                    <div className="form-field">
                      <span className="form-label">Nombre</span>
                      <select
                        className="form-select"
                        value={selectedParticipantId}
                        onChange={e => setSelectedParticipantId(e.target.value)}
                      >
                        <option value="">— Sin asignar —</option>
                        {participants.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.firstName} {p.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-field">
                      <span className="form-label">Escuela</span>
                      <select
                        className="form-select"
                        value={selectedSchool}
                        onChange={e => setSelectedSchool(e.target.value as School | '')}
                      >
                        <option value="">— Sin asignar —</option>
                        {SCHOOL_OPTIONS.map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <span className="form-label">Nombre</span>
                      <input
                        className="form-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nombre del equipo..."
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Guardando...' : 'Listo'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
