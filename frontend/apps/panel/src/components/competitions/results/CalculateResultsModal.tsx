import { useState } from 'react'
import { Plus, Minus, X } from 'lucide-react'
import { toast } from 'sonner'
import { SCHOOL_LABELS } from '@/lib/labels'
import { ResultService } from '@/services/competition.service'
import { ParticipantPositionType, School } from '@ubes/types'
import type { ParticipantDTO, ResultCreateDTO } from '@ubes/types'

interface ResultRow {
  positionNumber: number
  positionType: ParticipantPositionType
  name: string
  participantId: string
}

interface Props {
  competitionId: string
  participants: ParticipantDTO[]
  onClose: () => void
  onSaved: () => void
}

const POSITION_TYPE_OPTIONS = [
  { value: ParticipantPositionType.INDIVIDUAL, label: 'Jugador' },
  { value: ParticipantPositionType.SCHOOL,     label: 'Escuela' },
  { value: ParticipantPositionType.SUPPORTER,  label: 'Hinchada' },
]

function emptyRow(positionNumber: number): ResultRow {
  return {
    positionNumber,
    positionType: ParticipantPositionType.INDIVIDUAL,
    name: '',
    participantId: '',
  }
}

export default function CalculateResultsModal({ competitionId, participants, onClose, onSaved }: Props) {
  const [rows, setRows] = useState<ResultRow[]>([emptyRow(1)])
  const [loading, setLoading] = useState(false)

  function addRow() {
    setRows(prev => [...prev, emptyRow(prev.length + 1)])
  }

  function removeRow(index: number) {
    setRows(prev => prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, positionNumber: i + 1 })))
  }

  function updateRow(index: number, patch: Partial<ResultRow>) {
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  async function handleFinalize() {
    const payload: ResultCreateDTO[] = rows.map(r => ({
      positionType: r.positionType,
      positionNumber: r.positionNumber,
      name: r.name,
      participantId: r.participantId || undefined,
    }))

    setLoading(true)
    try {
      await ResultService.calculateResults(competitionId, payload)
      toast.success('Resultados calculados')
      onSaved()
    } catch {
      toast.error('Error al calcular resultados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">Definición de Resultados</span>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 32px', gap: 6, alignItems: 'center' }}>
            <span className="form-label" style={{ textAlign: 'center' }}>#</span>
            <span className="form-label">Tipo</span>
            <span className="form-label">Nombre</span>
            <span />
          </div>

          {rows.map((row, i) => (
            <ResultRowItem
              key={i}
              row={row}
              participants={participants}
              onChange={patch => updateRow(i, patch)}
              onRemove={() => removeRow(i)}
              canRemove={rows.length > 1}
            />
          ))}

          <button
            className="btn btn-ghost"
            onClick={addRow}
            style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleFinalize} disabled={loading}>
            {loading ? 'Calculando...' : 'Finalizar'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface RowProps {
  row: ResultRow
  participants: ParticipantDTO[]
  onChange: (patch: Partial<ResultRow>) => void
  onRemove: () => void
  canRemove: boolean
}

function ResultRowItem({ row, participants, onChange, onRemove, canRemove }: RowProps) {
  const isIndividual = row.positionType === ParticipantPositionType.INDIVIDUAL

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 32px', gap: 6, alignItems: 'center' }}>
      <span style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>{row.positionNumber}</span>

      <select
        className="form-select"
        value={row.positionType}
        onChange={e => onChange({ positionType: e.target.value as ResultRow['positionType'], participantId: '', name: '' })}
      >
        {POSITION_TYPE_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {isIndividual ? (
        <select
          className="form-select"
          value={row.participantId}
          onChange={e => onChange({ participantId: e.target.value })}
        >
          <option value="">— Seleccionar —</option>
          {participants.map(p => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="form-input"
          placeholder="Nombre..."
          value={row.name}
          onChange={e => onChange({ name: e.target.value })}
        />
      )}

      <button
        className="modal-close-btn"
        onClick={onRemove}
        disabled={!canRemove}
        style={{ opacity: canRemove ? 1 : 0.3 }}
        title="Eliminar fila"
      >
        <Minus size={13} />
      </button>
    </div>
  )
}
