import { useRef, useState } from 'react'
import { Check, Trash2, X, ExternalLink } from 'lucide-react'
import { School, IdType, ParticipantRole } from '@ubes/types'
import { SCHOOL_LABELS, PARTICIPANT_ROLE_LABELS, ID_TYPE_LABELS } from '@/lib/labels'
import Stepper from '@/components/ui/Stepper'
import participantService from '@/services/participantService'
import type { ParticipantDTO, ParticipantCreateDTO, ParticipantUpdateDTO } from '@ubes/types'

interface Props {
  competitionId: string
  participant?: ParticipantDTO
  requiresShirtNumbers: boolean
  requiresMedicalCertificates: boolean
  localParticipants: ParticipantDTO[]
  onSaved: (p: ParticipantDTO) => void
  onDeleted: () => void
  onClose: () => void
}

interface FormState {
  firstName: string
  lastName: string
  idType: IdType
  idNumber: string
  school: School | ''
  role: ParticipantRole
  shirtNumber: number
}

function initForm(p?: ParticipantDTO): FormState {
  return {
    firstName: p?.firstName ?? '',
    lastName: p?.lastName ?? '',
    idType: p?.idType ?? IdType.DNI,
    idNumber: p?.idNumber ?? '',
    school: p?.school ?? '',
    role: p?.role ?? ParticipantRole.PARTICIPANT,
    shirtNumber: p?.shirtNumber ?? 1,
  }
}

export default function ParticipantFormModal({
  competitionId, participant, requiresShirtNumbers, requiresMedicalCertificates,
  localParticipants, onSaved, onDeleted, onClose,
}: Props) {
  const isEdit = !!participant
  const [form, setForm] = useState<FormState>(initForm(participant))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [studentCertFile, setStudentCertFile] = useState<File | null>(null)
  const [removeStudentCert, setRemoveStudentCert] = useState(false)
  const studentCertRef = useRef<HTMLInputElement>(null)

  const [medicalCertFile, setMedicalCertFile] = useState<File | null>(null)
  const [removeMedicalCert, setRemoveMedicalCert] = useState(false)
  const medicalCertRef = useRef<HTMLInputElement>(null)

  const isDuplicateLocally =
    form.idNumber !== '' &&
    localParticipants.some(
      (p) => p.idType === form.idType && p.idNumber === form.idNumber && p.id !== participant?.id,
    )

  const existingStudentCertURL =
    !removeStudentCert && !studentCertFile ? (participant?.studentCertificateURL ?? null) : null
  const existingMedicalCertURL =
    !removeMedicalCert && !medicalCertFile ? (participant?.medicalCertificateURL ?? null) : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.school) return
    setSaving(true)
    setSaveError(null)
    try {
      let saved: ParticipantDTO
      if (isEdit) {
        const dto: ParticipantUpdateDTO = {
          firstName: form.firstName, lastName: form.lastName,
          idType: form.idType, idNumber: form.idNumber,
          school: form.school as School, role: form.role,
          ...(requiresShirtNumbers ? { shirtNumber: form.shirtNumber } : {}),
          ...(removeStudentCert ? { removeStudentCertificate: true } : {}),
          ...(removeMedicalCert ? { removeMedicalCertificate: true } : {}),
        }
        saved = await participantService.update(
          competitionId, participant!.id, dto, studentCertFile ?? undefined, medicalCertFile ?? undefined,
        )
      } else {
        const dto: ParticipantCreateDTO = {
          firstName: form.firstName, lastName: form.lastName,
          idType: form.idType, idNumber: form.idNumber,
          school: form.school as School, role: form.role,
          ...(requiresShirtNumbers ? { shirtNumber: form.shirtNumber } : {}),
        }
        saved = await participantService.add(
          competitionId, dto, studentCertFile ?? undefined, medicalCertFile ?? undefined,
        )
      }
      onSaved(saved)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setSaveError(status === 409
        ? 'Ya existe un participante con ese tipo y número de documento en esta competencia.'
        : (msg ?? 'Error al guardar el participante.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await participantService.delete(competitionId, participant!.id)
      onDeleted()
    } catch {
      setConfirmDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  function CertField({ label, existingURL, file, onFile, removeFlag, onRemove, onUndo, fileRef }: {
    label: string
    existingURL: string | null
    file: File | null
    onFile: (f: File) => void
    removeFlag: boolean
    onRemove: () => void
    onUndo: () => void
    fileRef: React.RefObject<HTMLInputElement | null>
  }) {
    return (
      <div className="form-field">
        <label className="form-label">{label}</label>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
        {file ? (
          <div className="cert-row">
            <span className="cert-label" style={{ fontSize: 12 }}>{file.name}</span>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 6px', color: 'var(--red-strong)' }}
              onClick={() => { onFile(null as unknown as File); if (fileRef.current) fileRef.current.value = '' }}>
              Quitar
            </button>
          </div>
        ) : existingURL ? (
          <div className="cert-row">
            <a href={existingURL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: 11, padding: '3px 8px' }}>
              Ver <ExternalLink size={10} />
            </a>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 6px' }} onClick={() => fileRef.current?.click()}>Subir otro</button>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 6px', color: 'var(--red-strong)' }} onClick={onRemove}>Eliminar</button>
          </div>
        ) : removeFlag ? (
          <div className="cert-row">
            <span className="cert-status">Se eliminará al guardar.</span>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 6px' }} onClick={onUndo}>Deshacer</button>
          </div>
        ) : (
          <label className="file-input-label" onClick={() => fileRef.current?.click()}>
            Subir archivo...
          </label>
        )}
      </div>
    )
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box-wide">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <span className="modal-title">{isEdit ? 'Editar Participante' : 'Nuevo Participante'}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {isEdit && !confirmDelete && (
                <button type="button" className="action-btn danger" title="Eliminar" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={14} />
                </button>
              )}
              <button type="submit" className="action-btn" title="Guardar" disabled={saving || !form.school}>
                <Check size={14} />
              </button>
              <button type="button" className="modal-close-btn" onClick={onClose}>
                <X size={14} />
              </button>
            </div>
          </div>

          {confirmDelete && (
            <div style={{ background: '#FEF2F2', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: 'var(--red-strong)' }}>¿Eliminar este participante?</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setConfirmDelete(false)}>Cancelar</button>
                <button type="button" className="btn btn-danger" style={{ fontSize: 12 }} disabled={deleting} onClick={handleDelete}>
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          )}

          <div className="form-grid">
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Nombre <span className="required">*</span></label>
                <input className="form-input" type="text" required value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div className="form-field">
                <label className="form-label">Apellido <span className="required">*</span></label>
                <input className="form-input" type="text" required value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Tipo de doc. <span className="required">*</span></label>
                <select className="form-select" required value={form.idType}
                  onChange={(e) => setForm((f) => ({ ...f, idType: e.target.value as IdType }))}>
                  {(Object.values(IdType) as IdType[]).map((v) => (
                    <option key={v} value={v}>{ID_TYPE_LABELS[v]}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Nº Documento <span className="required">*</span></label>
                <input className="form-input" type="text" required value={form.idNumber}
                  onChange={(e) => setForm((f) => ({ ...f, idNumber: e.target.value }))} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Escuela <span className="required">*</span></label>
                <select className="form-select" required value={form.school}
                  onChange={(e) => setForm((f) => ({ ...f, school: e.target.value as School }))}>
                  <option value="" disabled>Seleccionar...</option>
                  {(Object.values(School) as School[]).map((v) => (
                    <option key={v} value={v}>{SCHOOL_LABELS[v]}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Rol <span className="required">*</span></label>
                <select className="form-select" required value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as ParticipantRole }))}>
                  {(Object.values(ParticipantRole) as ParticipantRole[]).map((v) => (
                    <option key={v} value={v}>{PARTICIPANT_ROLE_LABELS[v]}</option>
                  ))}
                </select>
              </div>
            </div>

            {requiresShirtNumbers && (
              <div className="form-field">
                <label className="form-label">Nº Camiseta</label>
                <Stepper value={form.shirtNumber} onChange={(v) => setForm((f) => ({ ...f, shirtNumber: v }))} min={1} max={99} />
              </div>
            )}

            {requiresMedicalCertificates && (
              <>
                <CertField label="Cert. Alumno Reg." existingURL={existingStudentCertURL} file={studentCertFile}
                  onFile={(f) => { setStudentCertFile(f); setRemoveStudentCert(false) }}
                  removeFlag={removeStudentCert} onRemove={() => setRemoveStudentCert(true)}
                  onUndo={() => setRemoveStudentCert(false)} fileRef={studentCertRef} />
                <CertField label="Ficha Médica" existingURL={existingMedicalCertURL} file={medicalCertFile}
                  onFile={(f) => { setMedicalCertFile(f); setRemoveMedicalCert(false) }}
                  removeFlag={removeMedicalCert} onRemove={() => setRemoveMedicalCert(true)}
                  onUndo={() => setRemoveMedicalCert(false)} fileRef={medicalCertRef} />
              </>
            )}

            {isDuplicateLocally && (
              <p className="form-hint" style={{ color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 7, padding: '8px 10px' }}>
                Advertencia: ya hay un participante con este documento en la lista actual.
              </p>
            )}

            {saveError && <p className="form-error" style={{ background: '#FEF2F2', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 7, padding: '8px 10px' }}>{saveError}</p>}

            <button type="submit" disabled={saving || !form.school} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Agregar participante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
