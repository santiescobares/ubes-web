import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { PunishmentService } from '@/services/punishmentService'

const UNIT_SECONDS: Record<string, number> = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
  months: 2592000,
  years: 31536000,
}

const UNIT_LABELS: Record<string, string> = {
  seconds: 'Segundos',
  minutes: 'Minutos',
  hours: 'Horas',
  days: 'Días',
  months: 'Meses',
  years: 'Años',
}

interface Props {
  userId: string
  onClose: () => void
  onCreated: () => void
}

export default function NewPunishmentModal({ userId, onClose, onCreated }: Props) {
  const [reason, setReason] = useState('')
  const [amount, setAmount] = useState<number>(30)
  const [unit, setUnit] = useState('days')
  const [isPermanent, setIsPermanent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ reason?: string; amount?: string }>({})

  function validate() {
    const errs: typeof errors = {}
    if (!reason.trim()) errs.reason = 'La razón es requerida'
    else if (reason.trim().length < 10) errs.reason = 'Mínimo 10 caracteres'
    else if (reason.trim().length > 500) errs.reason = 'Máximo 500 caracteres'
    if (!isPermanent && (amount <= 0 || amount > 9999 || !Number.isInteger(amount)))
      errs.amount = 'Ingresá un valor entre 1 y 9999'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    setErrors(errs)
    if (Object.values(errs).some(Boolean)) return

    const durationSeconds = isPermanent ? 0 : amount * UNIT_SECONDS[unit]

    setSubmitting(true)
    try {
      await PunishmentService.create({ targetId: userId, reason: reason.trim(), durationSeconds })
      toast.success('Sanción creada')
      onCreated()
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data?.message ?? 'Error al crear la sanción')
        : 'Error al crear la sanción'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <span className="modal-title">Nueva Sanción</span>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Razón</label>
            <textarea
              className={`form-textarea${errors.reason ? ' error' : ''}`}
              rows={3}
              placeholder="Motivo de la sanción (mín. 10 caracteres)..."
              value={reason}
              onChange={(e) => { setReason(e.target.value); setErrors((p) => ({ ...p, reason: undefined })) }}
              maxLength={500}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {errors.reason
                ? <span className="form-error">{errors.reason}</span>
                : <span />}
              <span style={{ fontSize: 11, color: 'var(--muted-light)' }}>{reason.length} / 500</span>
            </div>
          </div>

          <div className="form-field" style={{ marginTop: -4 }}>
            <label className="form-label">Duración</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className={`form-input${errors.amount ? ' error' : ''}`}
                type="number"
                min={1}
                max={9999}
                value={isPermanent ? '' : amount}
                disabled={isPermanent}
                onChange={(e) => {
                  setAmount(Math.floor(Number(e.target.value)))
                  setErrors((p) => ({ ...p, amount: undefined }))
                }}
                style={{ width: 90, flexShrink: 0 }}
              />
              <select
                className="form-select"
                value={unit}
                disabled={isPermanent}
                onChange={(e) => setUnit(e.target.value)}
              >
                {Object.entries(UNIT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            {errors.amount && <span className="form-error">{errors.amount}</span>}
          </div>

          <div className="toggle-row">
            <div>
              <div className="toggle-label-text">Permanente</div>
              <div className="toggle-label-sub">Sin fecha de expiración</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 36, height: 20, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPermanent}
                onChange={(e) => setIsPermanent(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute', inset: 0,
                background: isPermanent ? 'var(--ink)' : 'rgba(0,0,0,0.15)',
                borderRadius: 20, transition: 'background 0.2s',
              }}>
                <span style={{
                  position: 'absolute',
                  top: 3, left: isPermanent ? 19 : 3,
                  width: 14, height: 14,
                  background: 'white',
                  borderRadius: '50%',
                  transition: 'left 0.2s',
                }} />
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button className="btn btn-danger" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><Loader2 size={13} className="spin-icon" />Sancionando...</> : 'Sancionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
