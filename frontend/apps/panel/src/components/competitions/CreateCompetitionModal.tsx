import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { CompetitionService } from '@/services/competition.service'
import CompetitionForm, { COMPETITION_FORM_INITIAL } from './CompetitionForm'
import type { CompetitionFormState } from './CompetitionForm'
import type { CompetitionCreateDTO } from '@ubes/types'

const BANNER_MAX_BYTES = 10 * 1024 * 1024

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function CreateCompetitionModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState<CompetitionFormState>(COMPETITION_FORM_INITIAL)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [regulationFile, setRegulationFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof CompetitionFormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [submitting, onClose])

  function validate(): boolean {
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = 'El nombre es obligatorio.'
    if (form.name.trim().length > 50) next.name = 'El nombre no puede superar 50 caracteres.'
    if (form.description.length > 1000) next.description = 'La descripción no puede superar 1000 caracteres.'
    if (!form.startingDate) {
      next.startingDate = 'La fecha de inicio es obligatoria.'
    } else if (new Date(form.startingDate) <= new Date()) {
      next.startingDate = 'La fecha de inicio debe ser en el futuro.'
    }
    if (form.endingDate && form.startingDate && form.endingDate <= form.startingDate)
      next.endingDate = 'La fecha de fin debe ser posterior a la de inicio.'
    if (!form.locationName.trim()) next.locationName = 'El lugar es obligatorio.'
    if (form.minParticipants < 1) next.minParticipants = 'Mínimo 1.'
    if (form.maxParticipants < 2) next.maxParticipants = 'Mínimo 2.'
    if (form.maxParticipants <= form.minParticipants)
      next.maxParticipants = 'Debe ser mayor al mínimo de participantes.'
    if (bannerFile && bannerFile.size > BANNER_MAX_BYTES)
      next.name = 'El banner no puede superar 10 MB.'
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
        location: { name: form.locationName.trim(), latitude: null, longitude: null },
        minParticipants: form.minParticipants,
        maxParticipants: form.maxParticipants,
        maxCoaches: form.maxCoaches,
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
    if (e.target === e.currentTarget && !submitting) onClose()
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
          regulationFile={regulationFile}
          setRegulationFile={setRegulationFile}
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
