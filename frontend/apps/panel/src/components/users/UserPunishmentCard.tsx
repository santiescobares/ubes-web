import { useState } from 'react'
import { Ban } from 'lucide-react'
import { formatDistanceStrict, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import type { PunishmentDTO } from '@ubes/types'
import { formatDateTime } from '@/lib/dateUtils'
import { PunishmentService } from '@/services/punishmentService'
import ConfirmActionModal from '@/components/ConfirmActionModal'

interface Props {
  punishment: PunishmentDTO
  onRefresh: () => void
}

type PunishmentStatus = 'active' | 'expired' | 'removed'

function getPunishmentStatus(p: PunishmentDTO): PunishmentStatus {
  if (p.removedAt) return 'removed'
  if (p.expiresAt && parseISO(p.expiresAt) <= new Date()) return 'expired'
  return 'active'
}

const STATUS_COLOR: Record<PunishmentStatus, string> = {
  active:  'var(--green-strong)',
  expired: 'var(--yellow)',
  removed: 'var(--red-strong)',
}

export default function UserPunishmentCard({ punishment, onRefresh }: Props) {
  const [showRemove, setShowRemove] = useState(false)
  const [removeReason, setRemoveReason] = useState('')
  const [removeError, setRemoveError] = useState('')
  const [removing, setRemoving] = useState(false)

  const status = getPunishmentStatus(punishment)
  const now = new Date()

  async function handleRemove() {
    if (!removeReason.trim()) {
      setRemoveError('La razón es requerida')
      return
    }
    setRemoving(true)
    try {
      await PunishmentService.remove(punishment.id, { reason: removeReason.trim() })
      toast.success('Sanción removida')
      setShowRemove(false)
      onRefresh()
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data?.message ?? 'Error al remover la sanción')
        : 'Error al remover la sanción'
      toast.error(msg)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <>
      <div className="punishment-card">
        <div
          className="punishment-card-bar"
          style={{ background: STATUS_COLOR[status] }}
        />

        {status === 'active' && (
          <button
            className="punishment-card-remove-btn"
            title="Remover sanción"
            onClick={() => { setRemoveReason(''); setRemoveError(''); setShowRemove(true) }}
          >
            <Ban size={13} />
          </button>
        )}

        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted-light)', marginBottom: 4 }}>
          ID: {punishment.id} • {formatDateTime(punishment.createdAt)}
        </div>

        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>
          Realizada por: <strong>{punishment.issuedBy.firstName} {punishment.issuedBy.lastName}</strong>
        </div>

        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
          Razón: <strong>{punishment.reason}</strong>
        </div>

        <div style={{ fontSize: 11, color: 'var(--muted-light)' }}>
          {status === 'active' && (
            punishment.expiresAt === null
              ? 'Esta sanción es permanente'
              : `Expira en ${formatDistanceStrict(now, parseISO(punishment.expiresAt!), { locale: es })}`
          )}
          {status === 'expired' && punishment.expiresAt && (
            `Expiró hace ${formatDistanceStrict(parseISO(punishment.expiresAt), now, { locale: es })}`
          )}
          {status === 'removed' && punishment.removedAt && punishment.removedBy && (
            <span>
              Removida el {formatDateTime(punishment.removedAt)} por {punishment.removedBy.firstName} {punishment.removedBy.lastName}.{' '}
              Razón: <strong>{punishment.removeReason}</strong>
            </span>
          )}
        </div>
      </div>

      {showRemove && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowRemove(false)}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <span className="modal-title">Remover sanción</span>
              <button className="modal-close-btn" onClick={() => setShowRemove(false)}>
                ✕
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-field">
                <label className="form-label">Razón de remoción <span className="required">*</span></label>
                <textarea
                  className={`form-textarea${removeError ? ' error' : ''}`}
                  rows={3}
                  placeholder="Motivo por el cual se remueve la sanción..."
                  value={removeReason}
                  onChange={(e) => { setRemoveReason(e.target.value); setRemoveError('') }}
                />
                {removeError && <span className="form-error">{removeError}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowRemove(false)} disabled={removing}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={handleRemove} disabled={removing}>
                  {removing ? 'Removiendo...' : 'Remover'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
