import { useState, type ReactNode } from 'react'
import { Trash2, Check, X, Minus, Plus, Upload, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { PARTICIPANT_ROLE_LABELS, SCHOOL_LABELS, ID_TYPE_LABELS } from '@/lib/labels'
import { ParticipantService } from '@/services/competition.service'
import { School, IdType, ParticipantRole } from '@ubes/types'
import type { ParticipantDTO, CompetitionDTO } from '@ubes/types'

interface Props {
  competition: CompetitionDTO
  participant?: ParticipantDTO
  existingParticipants?: ParticipantDTO[]
  onClose: () => void
  onSaved: () => void
}

interface FormState {
  firstName: string
  lastName: string
  idNumber: string
  idType: IdType
  school: School
  role: ParticipantRole
  shirtNumber: number | undefined
}

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  idNumber: '',
  idType: 'DNI',
  school: 'HUERTO',
  role: 'PARTICIPANT',
  shirtNumber: undefined,
}

export default function ParticipantFormModal({ competition, participant, existingParticipants, onClose, onSaved }: Props) {
  const isEdit = !!participant

  const [form, setForm] = useState<FormState>(
    participant
      ? {
          firstName: participant.firstName,
          lastName: participant.lastName,
          idNumber: participant.idNumber,
          idType: participant.idType,
          school: participant.school,
          role: participant.role,
          shirtNumber: participant.shirtNumber ?? undefined,
        }
      : EMPTY_FORM,
  )

  const [studentFile, setStudentFile] = useState<File | null>(null)
  const [medicalFile, setMedicalFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const showShirt = competition.requiresShirtNumbers
  const showCerts = competition.requiresMedicalCertificates
  const isCoach = form.role === ParticipantRole.COACH

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!form.firstName.trim()) next.firstName = 'Requerido'
    if (!form.lastName.trim()) next.lastName = 'Requerido'
    if (!form.idNumber.trim()) next.idNumber = 'Requerido'
    if (!isCoach) {
      if (showShirt && (form.shirtNumber ?? 1) < 1) next.shirtNumber = 'Mínimo 1'
      if (showShirt && !isEdit && existingParticipants) {
        const shirtNum = form.shirtNumber ?? 1
        const conflict = existingParticipants.some(p => p.school === form.school && p.shirtNumber === shirtNum)
        if (conflict) next.shirtNumber = `El número ${shirtNum} ya está en uso en ${SCHOOL_LABELS[form.school]}`
      }
      if (!studentFile && !participant?.studentCertificateURL) {
        next.studentFile = 'El certificado de alumno regular es obligatorio.'
      }
      if (competition.requiresMedicalCertificates && !medicalFile && !participant?.medicalCertificateURL) {
        next.medicalFile = 'La ficha médica es obligatoria.'
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSave() {
    if (!validate()) return

    if (isEdit) {
      const hasChanges =
        form.role !== participant!.role ||
        form.firstName.trim() !== participant!.firstName ||
        form.lastName.trim() !== participant!.lastName ||
        form.idNumber.trim() !== participant!.idNumber ||
        form.idType !== participant!.idType ||
        form.school !== participant!.school ||
        (!isCoach && showShirt && (form.shirtNumber ?? undefined) !== (participant!.shirtNumber ?? undefined)) ||
        studentFile !== null ||
        medicalFile !== null
      if (!hasChanges) {
        toast.info('Sin cambios')
        onClose()
        return
      }
    }

    setLoading(true)
    try {
      if (isEdit) {
        await ParticipantService.updateParticipant(
          participant!.id,
          {
            role: form.role,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            idType: form.idType,
            idNumber: form.idNumber.trim(),
            school: form.school,
            shirtNumber: (!isCoach && showShirt) ? form.shirtNumber : undefined,
          },
          studentFile ?? undefined,
          false,
          medicalFile ?? undefined,
          false,
        )
        toast.success('Participante actualizado')
      } else {
        await ParticipantService.addParticipants(
          competition.id,
          [{
            role: form.role,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            idType: form.idType,
            idNumber: form.idNumber.trim(),
            school: form.school,
            shirtNumber: (!isCoach && showShirt) ? (form.shirtNumber ?? 1) : undefined,
            studentCertificateFileRef: studentFile?.name,
            medicalCertificateFileRef: medicalFile?.name,
          }],
          studentFile ? [studentFile] : undefined,
          medicalFile ? [medicalFile] : undefined,
        )
        toast.success('Participante agregado')
      }
      onSaved()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Error al guardar.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setLoading(true)
    try {
      await ParticipantService.deleteParticipant(participant!.id)
      toast.success('Participante eliminado')
      onSaved()
    } catch {
      setLoading(false)
      toast.error('No se pudo eliminar el participante. Intentá de nuevo.')
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Información de Participante' : 'Nuevo Participante'}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {isEdit && (
              <button
                className="modal-close-btn"
                onClick={handleDelete}
                disabled={loading}
                title={confirmDelete ? 'Confirmar eliminación' : 'Eliminar'}
                style={confirmDelete ? { background: '#fee2e2', color: '#991b1b' } : {}}
              >
                <Trash2 size={14} />
              </button>
            )}
            {isEdit && (
              <button className="modal-close-btn" onClick={handleSave} disabled={loading} title="Guardar" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <Check size={14} />
              </button>
            )}
            <button className="modal-close-btn" onClick={onClose} title="Cerrar">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Nombre <span className="required">*</span></label>
              <input
                className={`form-input${errors.firstName ? ' error' : ''}`}
                value={form.firstName}
                onChange={e => set('firstName', e.target.value)}
                disabled={loading}
                placeholder="Nombre"
              />
              {errors.firstName && <span className="form-error">{errors.firstName}</span>}
            </div>
            <div className="form-field">
              <label className="form-label">Apellido <span className="required">*</span></label>
              <input
                className={`form-input${errors.lastName ? ' error' : ''}`}
                value={form.lastName}
                onChange={e => set('lastName', e.target.value)}
                disabled={loading}
                placeholder="Apellido"
              />
              {errors.lastName && <span className="form-error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Nº Documento <span className="required">*</span></label>
              <input
                className={`form-input${errors.idNumber ? ' error' : ''}`}
                value={form.idNumber}
                onChange={e => set('idNumber', e.target.value)}
                disabled={loading}
                placeholder="Número"
              />
              {errors.idNumber && <span className="form-error">{errors.idNumber}</span>}
            </div>
            <div className="form-field">
              <label className="form-label">Tipo Documento</label>
              <select
                className="form-select"
                value={form.idType}
                onChange={e => set('idType', e.target.value as IdType)}
                disabled={loading}
              >
                {Object.values(IdType).map(v => (
                  <option key={v} value={v}>{ID_TYPE_LABELS[v]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row" style={{ gridTemplateColumns: showShirt && !isCoach ? '1fr 1fr 1fr' : '1fr 1fr' }}>
            <div className="form-field">
              <label className="form-label">Escuela</label>
              <select
                className="form-select"
                value={form.school}
                onChange={e => set('school', e.target.value as School)}
                disabled={loading}
              >
                {Object.values(School).map(v => (
                  <option key={v} value={v}>{SCHOOL_LABELS[v]}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Rol</label>
              <select
                className="form-select"
                value={form.role}
                onChange={e => set('role', e.target.value as ParticipantRole)}
                disabled={loading}
              >
                {Object.values(ParticipantRole).map(v => (
                  <option key={v} value={v}>{PARTICIPANT_ROLE_LABELS[v]}</option>
                ))}
              </select>
            </div>
            {showShirt && !isCoach && (
              <div className="form-field">
                <label className="form-label">Nº Camiseta</label>
                <div style={{ display: 'flex', alignItems: 'stretch', gap: 6 }}>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => set('shirtNumber', Math.max(1, (form.shirtNumber ?? 1) - 1))}
                    disabled={loading || (form.shirtNumber ?? 1) <= 1}
                  >
                    <Minus size={13} />
                  </button>
                  <input
                    className={`form-input${errors.shirtNumber ? ' error' : ''}`}
                    type="number"
                    min={1}
                    value={form.shirtNumber ?? 1}
                    onChange={e => set('shirtNumber', Math.max(1, Number(e.target.value)))}
                    disabled={loading}
                    style={{ textAlign: 'center', width: 64, flex: 'none' }}
                  />
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => set('shirtNumber', (form.shirtNumber ?? 1) + 1)}
                    disabled={loading}
                  >
                    <Plus size={13} />
                  </button>
                </div>
                {errors.shirtNumber && <span className="form-error">{errors.shirtNumber}</span>}
              </div>
            )}
          </div>

          {!isCoach && (
            <div className="form-row">
              <FileField
                label={<>Cert. Alumno Reg. <span className="required">*</span></>}
                file={studentFile}
                existingUrl={participant?.studentCertificateURL}
                onChange={f => { setStudentFile(f); setErrors(prev => ({ ...prev, studentFile: undefined })) }}
                disabled={loading}
                error={errors.studentFile}
              />
              {showCerts && (
                <FileField
                  label={<>Ficha Médica <span className="required">*</span></>}
                  file={medicalFile}
                  existingUrl={participant?.medicalCertificateURL}
                  onChange={f => { setMedicalFile(f); setErrors(prev => ({ ...prev, medicalFile: undefined })) }}
                  disabled={loading}
                  error={errors.medicalFile}
                />
              )}
            </div>
          )}

          {confirmDelete && (
            <div style={{
              padding: '10px 12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              fontSize: 13,
              color: '#991b1b',
            }}>
              ¿Eliminar participante? Presioná el ícono de papelera nuevamente para confirmar.
            </div>
          )}

          {!isEdit && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading}
              style={{ width: '100%', marginTop: 4, justifyContent: 'center' }}
            >
              {loading ? 'Guardando...' : 'Crear'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

function FileField({ label, file, existingUrl, onChange, disabled, error }: {
  label: ReactNode
  file: File | null
  existingUrl?: string | null
  onChange: (f: File | null) => void
  disabled: boolean
  error?: string
}) {
  function handlePick() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,image/*'
    input.onchange = () => onChange(input.files?.[0] ?? null)
    input.click()
  }

  if (existingUrl && !file) {
    return (
      <div className="form-field">
        <label className="form-label">{label}</label>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            className="form-input"
            onClick={() => window.open(existingUrl, '_blank')}
            disabled={disabled}
            style={{ flex: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 12 }}
          >
            Ver
          </button>
          <button
            type="button"
            className="form-input"
            onClick={handlePick}
            disabled={disabled}
            title="Reemplazar"
            style={{ flex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)' }}
          >
            <Pencil size={12} />
          </button>
        </div>
        {error && <span className="form-error">{error}</span>}
      </div>
    )
  }

  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <button
        type="button"
        className={`form-input${error ? ' error' : ''}`}
        onClick={handlePick}
        disabled={disabled}
        style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: file ? 'var(--ink)' : 'var(--muted)', textAlign: 'left', fontSize: 12 }}
      >
        <Upload size={12} />
        {file ? file.name : 'Subir archivo'}
      </button>
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
