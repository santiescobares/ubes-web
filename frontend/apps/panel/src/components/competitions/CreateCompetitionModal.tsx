import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import CompetitionForm, { type CompetitionFormErrors, type CompetitionFormState, initialCompetitionFormState } from './CompetitionForm'
import CompetitionService from '@/services/competitionService'
import type { CompetitionDTO } from '@ubes/types'

interface Props {
  onClose: () => void
  onCreated: (competition: CompetitionDTO) => void
}

function validate(form: CompetitionFormState): CompetitionFormErrors {
  const errors: CompetitionFormErrors = {}
  const now = new Date()
  const bufferMs = 60_000 // 1 min buffer for @Future

  if (!form.name.trim()) {
    errors.name = 'El nombre es obligatorio'
  } else if (form.name.trim().length > 50) {
    errors.name = 'El nombre no puede superar los 50 caracteres'
  }

  if (form.description.length > 1000) {
    errors.description = 'La descripción no puede superar los 1000 caracteres'
  }

  if (!form.startingDate) {
    errors.startingDate = 'La fecha de inicio es obligatoria'
  } else {
    const start = new Date(form.startingDate)
    if (start.getTime() <= now.getTime() + bufferMs) {
      errors.startingDate = 'La fecha de inicio debe ser futura'
    }
  }

  if (!form.endingDate) {
    errors.endingDate = 'La fecha de fin es obligatoria'
  } else {
    const end = new Date(form.endingDate)
    if (end.getTime() <= now.getTime() + bufferMs) {
      errors.endingDate = 'La fecha de fin debe ser futura'
    } else if (form.startingDate) {
      const start = new Date(form.startingDate)
      if (end <= start) {
        errors.endingDate = 'La fecha de fin debe ser posterior a la de inicio'
      }
    }
  }

  if (form.locationName.trim().length > 100) {
    errors.locationName = 'El nombre del lugar no puede superar los 100 caracteres'
  }

  if (form.latitude != null && (form.latitude < -90 || form.latitude > 90)) {
    errors.latitude = 'Latitud inválida (debe estar entre -90 y 90)'
  }
  if (form.longitude != null && (form.longitude < -180 || form.longitude > 180)) {
    errors.longitude = 'Longitud inválida (debe estar entre -180 y 180)'
  }

  if (form.minParticipants < 0 || form.minParticipants > 99) {
    errors.minParticipants = 'Debe estar entre 0 y 99'
  }

  if (form.maxParticipants < 1 || form.maxParticipants > 99) {
    errors.maxParticipants = 'Debe estar entre 1 y 99'
  } else if (form.maxParticipants < form.minParticipants) {
    errors.maxParticipants = 'El máximo debe ser ≥ al mínimo'
  }

  if (form.maxCoaches < 0 || form.maxCoaches > 99) {
    errors.maxCoaches = 'Debe estar entre 0 y 99'
  }

  return errors
}

function hasErrors(errors: CompetitionFormErrors): boolean {
  return Object.keys(errors).length > 0
}

export default function CreateCompetitionModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState<CompetitionFormState>(initialCompetitionFormState)
  const [errors, setErrors] = useState<CompetitionFormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (hasErrors(errs)) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      const dto = {
        name: form.name.trim(),
        description: form.description,
        startingDate: form.startingDate,
        endingDate: form.endingDate,
        location: form.locationName.trim() ? {
          name: form.locationName.trim(),
          latitude: form.latitude ?? null,
          longitude: form.longitude ?? null,
        } : undefined,
        minParticipants: form.minParticipants,
        maxParticipants: form.maxParticipants,
        maxCoaches: form.maxCoaches,
        requiresShirtNumbers: form.requiresShirtNumbers,
        requiresMedicalCertificates: form.requiresMedicalCertificates,
      }
      const created = await CompetitionService.create(dto, form.bannerFile, form.regulationFile)
      toast.success('Competencia creada')
      onCreated(created)
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Error al crear la competencia')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box-wide modal-form-container">
        <form onSubmit={handleSubmit} noValidate>
          {/* Header sticky */}
          <div className="modal-form-header">
            <span className="modal-title">Crear Competencia</span>
            <button type="button" className="modal-close-btn" onClick={onClose} disabled={submitting}>
              <X size={14} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="modal-form-scroll">
            <CompetitionForm
              value={form}
              onChange={setForm}
              errors={errors}
              mode="create"
              disabled={submitting}
            />
          </div>

          {/* Footer sticky */}
          <div className="modal-form-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="spin-icon" />
                  Creando...
                </>
              ) : (
                'Crear Competencia'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
