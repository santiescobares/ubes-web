import { useState, useRef } from 'react'
import { X, Pencil, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import type { CompetitionDTO, ParticipantDTO } from '@ubes/types'
import { IdType, ParticipantRole, School } from '@ubes/types'
import FileDropzone from '@/components/ui/FileDropzone'
import Stepper from '@/components/ui/Stepper'
import ConfirmActionModal from '@/components/ConfirmActionModal'
import ParticipantService from '@/services/participantService'
import { SCHOOL_LABELS } from '@/lib/schoolLabels'

type ModalMode = 'view' | 'edit' | 'create'

interface ParticipantForm {
  firstName: string
  lastName: string
  idNumber: string
  idType: string
  school: string
  role: string
  shirtNumber: string
}

type FormErrors = Partial<Record<keyof ParticipantForm | 'studentFile' | 'medicalFile', string>>

interface Props {
  competition: CompetitionDTO
  mode: ModalMode
  participant?: ParticipantDTO
  onClose: () => void
  onSaved: (p: ParticipantDTO | null) => void
}


function validateForm(
  form: ParticipantForm,
  studentFile: File | null,
  medicalFile: File | null,
  requiresMedical: boolean,
  hasStudentURL: boolean,
  hasMedicalURL: boolean,
  mode: ModalMode,
): FormErrors {
  const errors: FormErrors = {}
  if (!form.firstName.trim() || form.firstName.trim().length < 3 || form.firstName.trim().length > 30)
    errors.firstName = 'El nombre debe tener entre 3 y 30 caracteres'
  if (!form.lastName.trim() || form.lastName.trim().length < 3 || form.lastName.trim().length > 30)
    errors.lastName = 'El apellido debe tener entre 3 y 30 caracteres'
  if (!form.idNumber.trim() || form.idNumber.trim().length > 15)
    errors.idNumber = 'El número de documento es obligatorio (máx. 15 caracteres)'
  if (!form.idType) errors.idType = 'El tipo de documento es obligatorio'
  if (!form.school) errors.school = 'La escuela es obligatoria'
  if (!form.role) errors.role = 'El rol es obligatorio'
  if (form.role === ParticipantRole.PARTICIPANT) {
    const sNum = parseInt(form.shirtNumber)
    if (form.shirtNumber !== '' && (isNaN(sNum) || sNum < 0 || sNum > 99))
      errors.shirtNumber = 'El número de camiseta debe estar entre 0 y 99'
    if (mode !== 'view' && !hasStudentURL && !studentFile)
      errors.studentFile = 'El certificado de alumno regular es obligatorio'
    if (studentFile) {
      const ext = studentFile.name.split('.').pop()?.toLowerCase() ?? ''
      if (!['pdf', 'png', 'jpg', 'jpeg'].includes(ext)) errors.studentFile = 'Formato no permitido (pdf, png, jpg, jpeg)'
      else if (studentFile.size > 5 * 1024 * 1024) errors.studentFile = 'El archivo no puede superar los 5 MB'
    }
    if (requiresMedical && mode !== 'view' && !hasMedicalURL && !medicalFile)
      errors.medicalFile = 'La ficha médica es obligatoria'
    if (medicalFile) {
      const ext = medicalFile.name.split('.').pop()?.toLowerCase() ?? ''
      if (!['pdf', 'png', 'jpg', 'jpeg'].includes(ext)) errors.medicalFile = 'Formato no permitido (pdf, png, jpg, jpeg)'
      else if (medicalFile.size > 5 * 1024 * 1024) errors.medicalFile = 'El archivo no puede superar los 5 MB'
    }
  }
  return errors
}

function CertButton({
  label,
  url,
  file,
  mode,
  onFileChange,
  error,
  required,
}: {
  label: string
  url: string | null
  file: File | null
  mode: ModalMode
  onFileChange: (f: File | null) => void
  error?: string
  required?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  if (mode === 'view') {
    return (
      <div className="cert-row">
        <span className="cert-label">{label}</span>
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
            <ExternalLink size={12} /> Ver
          </a>
        ) : (
          <span className="cert-status">Vacío</span>
        )}
      </div>
    )
  }

  const hasContent = url || file

  if (hasContent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="cert-row">
          <span className="cert-label">{label}</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {(url || file) && (
              url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
                  <ExternalLink size={12} /> Ver
                </a>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{file!.name}</span>
              )
            )}
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: 12, padding: '4px 10px' }}
              onClick={() => inputRef.current?.click()}
            >
              <Pencil size={11} /> Cambiar
            </button>
          </div>
        </div>
        <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) onFileChange(f); e.target.value = '' }} />
        {error && <span className="form-error">{error}</span>}
      </div>
    )
  }

  return (
    <div className="form-field">
      <label className="form-label">{label} {required && mode !== 'view' && <span className="required">*</span>}</label>
      <FileDropzone
        accept={['pdf', 'png', 'jpg', 'jpeg']}
        maxSizeMB={5}
        value={file}
        onChange={onFileChange}
        label={`Subir ${label.toLowerCase()}`}
        hint="PDF, PNG, JPG — máx. 5 MB"
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export default function ParticipantModal({ competition, mode: initialMode, participant, onClose, onSaved }: Props) {
  const [internalMode, setInternalMode] = useState<ModalMode>(initialMode)
  const [form, setForm] = useState<ParticipantForm>({
    firstName: participant?.firstName ?? '',
    lastName: participant?.lastName ?? '',
    idNumber: participant?.idNumber ?? '',
    idType: participant?.idType ?? IdType.DNI,
    school: participant?.school ?? '',
    role: participant?.role ?? ParticipantRole.PARTICIPANT,
    shirtNumber: participant?.shirtNumber != null ? String(participant.shirtNumber) : '',
  })
  const [studentFile, setStudentFile] = useState<File | null>(null)
  const [medicalFile, setMedicalFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function set<K extends keyof ParticipantForm>(key: K, val: string) {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  async function handleSubmit() {
    const errs = validateForm(
      form, studentFile, medicalFile,
      competition.requiresMedicalCertificates,
      !!participant?.studentCertificateURL,
      !!participant?.medicalCertificateURL,
      internalMode,
    )
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSubmitting(true)
    try {
      let result: ParticipantDTO
      if (internalMode === 'create') {
        result = await ParticipantService.create(
          competition.id,
          {
            role: form.role as ParticipantRole,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            idType: form.idType as typeof IdType[keyof typeof IdType],
            idNumber: form.idNumber.trim(),
            school: form.school as typeof School[keyof typeof School],
            shirtNumber: form.shirtNumber !== '' ? parseInt(form.shirtNumber) : undefined,
          },
          studentFile,
          medicalFile,
        )
      } else {
        result = await ParticipantService.update(
          competition.id,
          participant!.id,
          {
            role: form.role as ParticipantRole,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            idType: form.idType as typeof IdType[keyof typeof IdType],
            idNumber: form.idNumber.trim(),
            school: form.school as typeof School[keyof typeof School],
            shirtNumber: form.shirtNumber !== '' ? parseInt(form.shirtNumber) : undefined,
          },
          studentFile,
          medicalFile,
        )
      }
      toast.success(internalMode === 'create' ? 'Participante agregado' : 'Participante actualizado')
      onSaved(result)
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Error al guardar el participante')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    setSubmitting(true)
    try {
      await ParticipantService.remove(competition.id, participant!.id)
      toast.success('Participante eliminado')
      onSaved(null)
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Error al eliminar el participante')
    } finally {
      setSubmitting(false)
    }
  }

  const isParticipant = form.role === ParticipantRole.PARTICIPANT
  const title = internalMode === 'create' ? 'Nuevo Participante' : 'Información de Participante'

  return (
    <>
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-box modal-box-wide modal-form-container">
          <div className="modal-form-header">
            <span className="modal-title">{title}</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {internalMode === 'view' && (
                <button type="button" className="action-btn" onClick={() => setInternalMode('edit')} title="Editar">
                  <Pencil size={13} />
                </button>
              )}
              <button type="button" className="modal-close-btn" onClick={onClose} disabled={submitting}>
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="modal-form-scroll">
            <div className="form-grid">
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Nombre <span className="required">*</span></label>
                  <input className={`form-input${errors.firstName ? ' error' : ''}`} value={form.firstName}
                    onChange={e => set('firstName', e.target.value)} disabled={internalMode === 'view' || submitting}
                    placeholder="Nombre" maxLength={30} />
                  {errors.firstName && <span className="form-error">{errors.firstName}</span>}
                </div>
                <div className="form-field">
                  <label className="form-label">Apellido <span className="required">*</span></label>
                  <input className={`form-input${errors.lastName ? ' error' : ''}`} value={form.lastName}
                    onChange={e => set('lastName', e.target.value)} disabled={internalMode === 'view' || submitting}
                    placeholder="Apellido" maxLength={30} />
                  {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Nº Documento <span className="required">*</span></label>
                  <input className={`form-input${errors.idNumber ? ' error' : ''}`} value={form.idNumber}
                    onChange={e => set('idNumber', e.target.value)} disabled={internalMode === 'view' || submitting}
                    placeholder="Ej. 12345678" maxLength={15} />
                  {errors.idNumber && <span className="form-error">{errors.idNumber}</span>}
                </div>
                <div className="form-field">
                  <label className="form-label">Tipo Documento <span className="required">*</span></label>
                  <select className={`form-input${errors.idType ? ' error' : ''}`} value={form.idType}
                    onChange={e => set('idType', e.target.value)} disabled={internalMode === 'view' || submitting}>
                    <option value={IdType.DNI}>DNI</option>
                    <option value={IdType.PASSPORT}>Pasaporte</option>
                  </select>
                  {errors.idType && <span className="form-error">{errors.idType}</span>}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: competition.requiresShirtNumbers && form.role !== ParticipantRole.COACH
                  ? '1fr 1fr 1fr'
                  : '1fr 1fr',
                gap: 12,
              }}>
                <div className="form-field">
                  <label className="form-label">Escuela <span className="required">*</span></label>
                  <select className={`form-input${errors.school ? ' error' : ''}`} value={form.school}
                    onChange={e => set('school', e.target.value)} disabled={internalMode === 'view' || submitting}>
                    <option value="">Seleccioná una escuela</option>
                    {Object.entries(SCHOOL_LABELS).map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))}
                  </select>
                  {errors.school && <span className="form-error">{errors.school}</span>}
                </div>
                <div className="form-field">
                  <label className="form-label">Rol <span className="required">*</span></label>
                  <select className={`form-input${errors.role ? ' error' : ''}`} value={form.role}
                    onChange={e => set('role', e.target.value)} disabled={internalMode === 'view' || submitting}>
                    <option value={ParticipantRole.PARTICIPANT}>Participante</option>
                    <option value={ParticipantRole.COACH}>Entrenador</option>
                  </select>
                  {errors.role && <span className="form-error">{errors.role}</span>}
                </div>
                {competition.requiresShirtNumbers && form.role !== ParticipantRole.COACH && (
                  <div className="form-field">
                    <label className="form-label">Nº Camiseta</label>
                    <Stepper
                      value={form.shirtNumber !== '' ? parseInt(form.shirtNumber) : 0}
                      onChange={v => set('shirtNumber', String(v))}
                      min={0}
                      max={99}
                      disabled={internalMode === 'view' || submitting}
                    />
                    {errors.shirtNumber && <span className="form-error">{errors.shirtNumber}</span>}
                  </div>
                )}
              </div>

              {isParticipant && (
                <CertButton
                  label="Certificado Alumno Regular"
                  url={participant?.studentCertificateURL ?? null}
                  file={studentFile}
                  mode={internalMode}
                  onFileChange={setStudentFile}
                  error={errors.studentFile}
                  required
                />
              )}

              {isParticipant && competition.requiresMedicalCertificates && (
                <CertButton
                  label="Ficha Médica"
                  url={participant?.medicalCertificateURL ?? null}
                  file={medicalFile}
                  mode={internalMode}
                  onFileChange={setMedicalFile}
                  error={errors.medicalFile}
                  required
                />
              )}
            </div>
          </div>

          {internalMode === 'create' && (
            <div className="modal-form-footer">
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><Loader2 size={13} className="spin-icon" />Guardando...</> : 'Guardar'}
              </button>
            </div>
          )}
          {internalMode === 'edit' && (
            <div className="modal-form-footer" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)} disabled={submitting}>
                <Trash2 size={13} /> Eliminar
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <><Loader2 size={13} className="spin-icon" />Guardando...</> : 'Guardar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmActionModal
          title="Eliminar participante"
          message={`¿Eliminás a ${participant?.firstName} ${participant?.lastName} de la competencia?`}
          confirmLabel="Eliminar"
          danger
          onConfirm={handleDelete}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}
