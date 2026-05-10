import { useRef, useState } from 'react'
import { Check, Trash2, X, ExternalLink } from 'lucide-react'
import { School, IdType, ParticipantRole } from '@ubes/types'
import { SCHOOL_LABEL, PARTICIPANT_ROLE_LABEL, ID_TYPE_LABEL } from '@/lib/labels'
import Stepper from '@/components/ui/Stepper'
import participantService from '@/services/participantService'
import type { ParticipantDTO, ParticipantCreateDTO, ParticipantUpdateDTO } from '@ubes/types'

interface Props {
  competitionId: string
  /** Undefined = create mode. Defined = edit mode. */
  participant?: ParticipantDTO
  requiresShirtNumbers: boolean
  requiresMedicalCertificates: boolean
  /** Currently loaded page of participants — used for optimistic duplicate check. */
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
  competitionId,
  participant,
  requiresShirtNumbers,
  requiresMedicalCertificates,
  localParticipants,
  onSaved,
  onDeleted,
  onClose,
}: Props) {
  const isEdit = !!participant
  const [form, setForm] = useState<FormState>(initForm(participant))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Student certificate state
  const [studentCertFile, setStudentCertFile] = useState<File | null>(null)
  const [removeStudentCert, setRemoveStudentCert] = useState(false)
  const studentCertRef = useRef<HTMLInputElement>(null)

  // Medical certificate state
  const [medicalCertFile, setMedicalCertFile] = useState<File | null>(null)
  const [removeMedicalCert, setRemoveMedicalCert] = useState(false)
  const medicalCertRef = useRef<HTMLInputElement>(null)

  // Optimistic duplicate check (non-blocking)
  const isDuplicateLocally =
    form.idNumber !== '' &&
    localParticipants.some(
      (p) =>
        p.idType === form.idType &&
        p.idNumber === form.idNumber &&
        p.id !== participant?.id,
    )

  // Effective cert URLs (null if removed or replaced)
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
          firstName: form.firstName,
          lastName: form.lastName,
          idType: form.idType,
          idNumber: form.idNumber,
          school: form.school as School,
          role: form.role,
          ...(requiresShirtNumbers ? { shirtNumber: form.shirtNumber } : {}),
          ...(removeStudentCert ? { removeStudentCertificate: true } : {}),
          ...(removeMedicalCert ? { removeMedicalCertificate: true } : {}),
        }
        saved = await participantService.update(
          competitionId,
          participant!.id,
          dto,
          studentCertFile ?? undefined,
          medicalCertFile ?? undefined,
        )
      } else {
        const dto: ParticipantCreateDTO = {
          firstName: form.firstName,
          lastName: form.lastName,
          idType: form.idType,
          idNumber: form.idNumber,
          school: form.school as School,
          role: form.role,
          ...(requiresShirtNumbers ? { shirtNumber: form.shirtNumber } : {}),
        }
        saved = await participantService.add(
          competitionId,
          dto,
          studentCertFile ?? undefined,
          medicalCertFile ?? undefined,
        )
      }
      onSaved(saved)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (status === 409) {
        setSaveError('Ya existe un participante con ese tipo y número de documento en esta competencia.')
      } else {
        setSaveError(msg ?? 'Error al guardar el participante.')
      }
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
            <h2 className="text-sm font-semibold text-gray-900">
              {isEdit ? 'Información de Participante' : 'Nuevo Participante'}
            </h2>
            <div className="flex items-center gap-1">
              {isEdit && !confirmDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  title="Eliminar participante"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <button
                type="submit"
                disabled={saving || !form.school}
                title="Guardar"
                className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Check size={15} />
              </button>
              <button
                type="button"
                onClick={onClose}
                title="Cerrar"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Delete confirmation banner */}
          {confirmDelete && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <span className="text-sm text-red-700">¿Eliminar este participante?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg disabled:opacity-60"
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          )}

          {/* Fields */}
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Apellido *</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de documento *</label>
                <select
                  required
                  value={form.idType}
                  onChange={(e) => setForm((f) => ({ ...f, idType: e.target.value as IdType }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {(Object.values(IdType) as IdType[]).map((v) => (
                    <option key={v} value={v}>{ID_TYPE_LABEL[v]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nº Documento *</label>
                <input
                  type="text"
                  required
                  value={form.idNumber}
                  onChange={(e) => setForm((f) => ({ ...f, idNumber: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Escuela *</label>
                <select
                  required
                  value={form.school}
                  onChange={(e) => setForm((f) => ({ ...f, school: e.target.value as School }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="" disabled>Seleccionar...</option>
                  {(Object.values(School) as School[]).map((v) => (
                    <option key={v} value={v}>{SCHOOL_LABEL[v]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rol *</label>
                <select
                  required
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as ParticipantRole }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {(Object.values(ParticipantRole) as ParticipantRole[]).map((v) => (
                    <option key={v} value={v}>{PARTICIPANT_ROLE_LABEL[v]}</option>
                  ))}
                </select>
              </div>
            </div>

            {requiresShirtNumbers && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nº Camiseta</label>
                <Stepper
                  value={form.shirtNumber}
                  onChange={(v) => setForm((f) => ({ ...f, shirtNumber: v }))}
                  min={1}
                  max={99}
                />
              </div>
            )}

            {requiresMedicalCertificates && (
              <>
                {/* Student certificate */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cert. Alumno Reg.</label>
                  <input
                    ref={studentCertRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) { setStudentCertFile(f); setRemoveStudentCert(false) }
                    }}
                  />
                  {studentCertFile ? (
                    <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="text-xs text-gray-700 truncate mr-2">{studentCertFile.name}</span>
                      <button type="button" onClick={() => { setStudentCertFile(null); if (studentCertRef.current) studentCertRef.current.value = '' }} className="text-xs text-red-500 shrink-0">Quitar</button>
                    </div>
                  ) : existingStudentCertURL ? (
                    <div className="flex items-center gap-2">
                      <a href={existingStudentCertURL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">Ver <ExternalLink size={11} /></a>
                      <button type="button" onClick={() => studentCertRef.current?.click()} className="text-xs text-gray-500 hover:text-gray-700">Subir otro</button>
                      <button type="button" onClick={() => setRemoveStudentCert(true)} className="text-xs text-red-500">Eliminar</button>
                    </div>
                  ) : removeStudentCert ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Se eliminará al guardar.</span>
                      <button type="button" onClick={() => setRemoveStudentCert(false)} className="text-xs text-blue-600">Deshacer</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => studentCertRef.current?.click()} className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 text-left">
                      Subir archivo...
                    </button>
                  )}
                </div>

                {/* Medical certificate */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ficha Médica</label>
                  <input
                    ref={medicalCertRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) { setMedicalCertFile(f); setRemoveMedicalCert(false) }
                    }}
                  />
                  {medicalCertFile ? (
                    <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="text-xs text-gray-700 truncate mr-2">{medicalCertFile.name}</span>
                      <button type="button" onClick={() => { setMedicalCertFile(null); if (medicalCertRef.current) medicalCertRef.current.value = '' }} className="text-xs text-red-500 shrink-0">Quitar</button>
                    </div>
                  ) : existingMedicalCertURL ? (
                    <div className="flex items-center gap-2">
                      <a href={existingMedicalCertURL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">Ver <ExternalLink size={11} /></a>
                      <button type="button" onClick={() => medicalCertRef.current?.click()} className="text-xs text-gray-500 hover:text-gray-700">Subir otro</button>
                      <button type="button" onClick={() => setRemoveMedicalCert(true)} className="text-xs text-red-500">Eliminar</button>
                    </div>
                  ) : removeMedicalCert ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Se eliminará al guardar.</span>
                      <button type="button" onClick={() => setRemoveMedicalCert(false)} className="text-xs text-blue-600">Deshacer</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => medicalCertRef.current?.click()} className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 text-left">
                      Subir archivo...
                    </button>
                  )}
                </div>
              </>
            )}

            {isDuplicateLocally && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Advertencia: ya hay un participante con este documento en la lista actual.
              </p>
            )}

            {saveError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {saveError}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || !form.school}
              className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Agregar participante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
