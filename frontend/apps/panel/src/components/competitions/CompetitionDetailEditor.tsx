import { useState, useRef, useMemo, useCallback } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import type { CompetitionDTO } from '@ubes/types'
import CompetitionForm, {
  type CompetitionFormState,
  type CompetitionFormErrors,
} from './CompetitionForm'
import StatusBadge from '@/components/ui/StatusBadge'
import ConfirmActionModal from '@/components/ConfirmActionModal'
import CompetitionService from '@/services/competitionService'

interface Props {
  competition: CompetitionDTO
  onReload: () => void
}

function competitionToFormState(c: CompetitionDTO): CompetitionFormState {
  return {
    name: c.name,
    description: c.description ?? '',
    startingDate: c.startingDate ? c.startingDate.slice(0, 16) : '',
    endingDate: c.endingDate ? c.endingDate.slice(0, 16) : '',
    registrationStartingDate: c.registrationStartingDate ? c.registrationStartingDate.slice(0, 16) : '',
    registrationEndingDate: c.registrationEndingDate ? c.registrationEndingDate.slice(0, 16) : '',
    locationName: c.location?.name ?? '',
    latitude: c.location?.latitude ?? null,
    longitude: c.location?.longitude ?? null,
    minParticipants: c.minParticipants,
    maxParticipants: c.maxParticipants,
    maxCoaches: c.maxCoaches,
    requiresShirtNumbers: c.requiresShirtNumbers,
    requiresMedicalCertificates: c.requiresMedicalCertificates,
    bannerFile: null,
    regulationFile: null,
  }
}

function isFormDisabled(c: CompetitionDTO): boolean {
  return c.status !== 'SCHEDULED' || c.registrationStatus === 'AVAILABLE'
}

function validate(form: CompetitionFormState): CompetitionFormErrors {
  const errors: CompetitionFormErrors = {}
  if (!form.name.trim()) errors.name = 'El nombre es obligatorio'
  else if (form.name.trim().length > 50) errors.name = 'El nombre no puede superar los 50 caracteres'
  if (form.description.length > 1000) errors.description = 'La descripción no puede superar los 1000 caracteres'
  if (!form.startingDate) errors.startingDate = 'La fecha de inicio es obligatoria'
  if (!form.endingDate) {
    errors.endingDate = 'La fecha de fin es obligatoria'
  } else if (form.startingDate && new Date(form.endingDate) <= new Date(form.startingDate)) {
    errors.endingDate = 'La fecha de fin debe ser posterior a la de inicio'
  }
  if (form.locationName.trim().length > 100) errors.locationName = 'El nombre del lugar no puede superar los 100 caracteres'
  if (form.minParticipants < 0 || form.minParticipants > 99) errors.minParticipants = 'Debe estar entre 0 y 99'
  if (form.maxParticipants < 1 || form.maxParticipants > 99) errors.maxParticipants = 'Debe estar entre 1 y 99'
  else if (form.maxParticipants < form.minParticipants) errors.maxParticipants = 'El máximo debe ser ≥ al mínimo'
  if (form.maxCoaches < 0 || form.maxCoaches > 99) errors.maxCoaches = 'Debe estar entre 0 y 99'
  if (form.registrationStartingDate || form.registrationEndingDate) {
    if (!form.registrationStartingDate) errors.registrationStartingDate = 'Obligatorio si se setea fecha de fin'
    if (!form.registrationEndingDate) errors.registrationEndingDate = 'Obligatorio si se setea fecha de inicio'
    if (form.registrationStartingDate && form.registrationEndingDate) {
      if (new Date(form.registrationEndingDate) <= new Date(form.registrationStartingDate))
        errors.registrationEndingDate = 'Debe ser posterior al inicio de inscripciones'
      if (form.startingDate && new Date(form.registrationEndingDate) >= new Date(form.startingDate))
        errors.registrationEndingDate = 'Las inscripciones deben cerrar antes del inicio de la competencia'
    }
  }
  return errors
}

type ConfirmKind = 'openReg' | 'closeReg' | 'start' | 'end' | 'cancel'

const CONFIRM_COPY: Record<ConfirmKind, { title: string; message: string; label: string; danger?: boolean }> = {
  openReg:  { title: 'Abrir inscripciones',      message: '¿Abrís las inscripciones para esta competencia?',           label: 'Abrir',     danger: false },
  closeReg: { title: 'Cerrar inscripciones',      message: '¿Cerrás las inscripciones? No se podrán reabrir.',          label: 'Cerrar',    danger: true  },
  start:    { title: 'Iniciar competencia',       message: '¿Iniciás la competencia ahora? No hay vuelta atrás.',       label: 'Iniciar',   danger: true  },
  end:      { title: 'Finalizar competencia',     message: '¿Finalizás la competencia? El estado pasará a FINALIZADA.',  label: 'Finalizar', danger: true  },
  cancel:   { title: 'Cancelar competencia',      message: '¿Cancelás la competencia? Esta acción es irreversible.',    label: 'Cancelar',  danger: true  },
}

export default function CompetitionDetailEditor({ competition, onReload }: Props) {
  const originalRef = useRef<CompetitionFormState>(competitionToFormState(competition))
  const [formValue, setFormValue] = useState<CompetitionFormState>(() => competitionToFormState(competition))
  const [errors, setErrors] = useState<CompetitionFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null)

  const formDisabled = isFormDisabled(competition)

  const hasChanges = useMemo(() => {
    return (
      JSON.stringify({ ...formValue, bannerFile: null, regulationFile: null }) !==
      JSON.stringify({ ...originalRef.current, bannerFile: null, regulationFile: null }) ||
      formValue.bannerFile !== null ||
      formValue.regulationFile !== null
    )
  }, [formValue])

  const handleSave = useCallback(async () => {
    const errs = validate(formValue)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSubmitting(true)
    try {
      const dto = {
        name: formValue.name.trim(),
        description: formValue.description,
        startingDate: formValue.startingDate,
        endingDate: formValue.endingDate || undefined,
        location: formValue.locationName.trim() ? {
          name: formValue.locationName.trim(),
          latitude: formValue.latitude,
          longitude: formValue.longitude,
        } : undefined,
        minParticipants: formValue.minParticipants,
        maxParticipants: formValue.maxParticipants,
        maxCoaches: formValue.maxCoaches,
        requiresShirtNumbers: formValue.requiresShirtNumbers,
        requiresMedicalCertificates: formValue.requiresMedicalCertificates,
        registrationStartingDate: formValue.registrationStartingDate || undefined,
        registrationEndingDate: formValue.registrationEndingDate || undefined,
      }
      await CompetitionService.update(
        competition.id,
        dto,
        formValue.bannerFile,
        false,
        formValue.regulationFile,
        false,
      )
      toast.success('Competencia actualizada')
      onReload()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Error al guardar los cambios')
    } finally {
      setSubmitting(false)
    }
  }, [formValue, competition.id, onReload])

  async function runAction(kind: ConfirmKind) {
    setSubmitting(true)
    try {
      switch (kind) {
        case 'openReg':  await CompetitionService.openRegistration(competition.id); break
        case 'closeReg': await CompetitionService.closeRegistration(competition.id, false); break
        case 'start':    await CompetitionService.start(competition.id); break
        case 'end':      await CompetitionService.end(competition.id); break
        case 'cancel':   await CompetitionService.cancel(competition.id); break
      }
      toast.success('Acción realizada correctamente')
      onReload()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Error al ejecutar la acción')
    } finally {
      setSubmitting(false)
    }
  }

  const { status, registrationStatus } = competition
  let primaryAction: { label: string; kind: ConfirmKind } | null = null
  if (status === 'SCHEDULED') {
    if (registrationStatus === 'UNAVAILABLE') primaryAction = { label: 'Abrir Inscripciones', kind: 'openReg' }
    else if (registrationStatus === 'AVAILABLE') primaryAction = { label: 'Cerrar Inscripciones', kind: 'closeReg' }
    else if (registrationStatus === 'EXPIRED')   primaryAction = { label: 'Iniciar Competencia',  kind: 'start'  }
  } else if (status === 'ONGOING') {
    primaryAction = { label: 'Finalizar Competencia', kind: 'end' }
  }

  const showCancel = status !== 'CANCELED' && status !== 'FINISHED'

  return (
    <>
      {/* Header */}
      <div className="detail-left-header">
        <span className="detail-left-name">
          {formValue.name.trim() || <span style={{ opacity: 0.35 }}>Sin nombre</span>}
        </span>
        <StatusBadge competition={competition} />
      </div>

      {/* Scrollable form */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 14 }}>
        <CompetitionForm
          value={formValue}
          onChange={setFormValue}
          errors={errors}
          mode="edit"
          disabled={formDisabled || submitting}
        />
      </div>

      {/* Save */}
      {!formDisabled && (
        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={!hasChanges || submitting}
          onClick={handleSave}
        >
          {submitting ? <Loader2 size={13} className="spin-icon" /> : <Save size={13} />}
          Guardar Cambios
        </button>
      )}

      {/* Lifecycle actions */}
      {(primaryAction || showCancel) && <hr className="divider-minimal" />}
      {(primaryAction || showCancel) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {primaryAction && (
            <button
              className="btn btn-secondary"
              style={{ width: '100%' }}
              disabled={submitting}
              onClick={() => setConfirm(primaryAction!.kind)}
            >
              {primaryAction.label}
            </button>
          )}
          {showCancel && (
            <button
              className="btn btn-danger"
              style={{ width: '100%' }}
              disabled={submitting}
              onClick={() => setConfirm('cancel')}
            >
              Cancelar Competencia
            </button>
          )}
        </div>
      )}

      {confirm && (
        <ConfirmActionModal
          {...CONFIRM_COPY[confirm]}
          onConfirm={() => runAction(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  )
}
