import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { CompetitionService } from '@/services/competition.service'
import CompetitionForm, { COMPETITION_FORM_INITIAL } from './CompetitionForm'
import type { CompetitionFormState } from './CompetitionForm'
import type { CompetitionCreateDTO } from '@ubes/types'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function CreateCompetitionModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState<CompetitionFormState>(COMPETITION_FORM_INITIAL)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [regulationFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof CompetitionFormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = 'El nombre es obligatorio.'
    if (!form.startingDate) next.startingDate = 'La fecha de inicio es obligatoria.'
    if (form.endingDate && form.startingDate && form.endingDate <= form.startingDate)
      next.endingDate = 'La fecha de fin debe ser posterior a la de inicio.'
    if (form.minParticipants < 1) next.minParticipants = 'Mínimo 1.'
    if (form.maxParticipants < form.minParticipants)
      next.maxParticipants = 'Debe ser mayor o igual al mínimo.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    try {
      const dto: CompetitionCreateDTO = {
        name: form.name.trim(),
        description: form.description.trim(),
        startingDate: form.startingDate,
        ...(form.endingDate ? { endingDate: form.endingDate } : {}),
        location: form.locationName.trim()
          ? { name: form.locationName.trim(), latitude: null, longitude: null }
          : null,
        minParticipants: form.minParticipants,
        maxParticipants: form.maxParticipants,
        requiresShirtNumbers: form.requiresShirtNumbers,
        requiresMedicalCertificates: form.requiresMedicalCertificates,
      }
      await CompetitionService.createCompetition(
        dto,
        bannerFile ?? undefined,
        regulationFile ?? undefined,
      )
      toast.success('Competencia creada')
      onCreated()
    } catch {
      toast.error('No se pudo crear la competencia. Revisá los datos e intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-box modal-box-wide">
        <div className="modal-header">
          <span className="modal-title">Nueva Competencia</span>
          <button className="modal-close-btn" onClick={onClose} disabled={submitting}>
            <X size={16} />
          </button>
        </div>

        <CompetitionForm
          value={form}
          onChange={setForm}
          errors={errors}
          bannerFile={bannerFile}
          setBannerFile={setBannerFile}
          disabled={submitting}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear competencia'}
          </button>
        </div>
      </div>
    </div>
  )
}
