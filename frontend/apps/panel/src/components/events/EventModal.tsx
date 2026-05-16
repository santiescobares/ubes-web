import { useState } from 'react'
import { X, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { EventType } from '@ubes/types'
import type { EventDTO } from '@ubes/types'
import { toLocalDateTimeString } from '@/lib/dateUtils'
import EventService from '@/services/eventService'
import ConfirmActionModal from '@/components/ConfirmActionModal'
import EventForm, { type EventFormState, type EventFormErrors, validateEventForm } from './EventForm'

interface BaseProps {
  onClose: () => void
  onSaved: (saved: EventDTO | null) => void
}

interface CreateProps extends BaseProps { mode: 'create'; baseDate?: Date }
interface EditProps extends BaseProps { mode: 'edit'; event: EventDTO; canManage?: boolean }

type Props = CreateProps | EditProps

function isEdit(p: Props): p is EditProps {
  return p.mode === 'edit'
}

function buildEmptyForm(baseDate?: Date): EventFormState {
  const now = new Date()
  const base = baseDate ?? now
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), now.getHours(), now.getMinutes())
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  return {
    name: '',
    type: EventType.OTHER,
    description: '',
    startingDate: toLocalDateTimeString(start),
    endingDate: toLocalDateTimeString(end),
    locationName: '',
    latitude: null,
    longitude: null,
  }
}

function eventToForm(e: EventDTO): EventFormState {
  const toLocal = (iso: string) => {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  return {
    name: e.name,
    type: e.type,
    description: e.description ?? '',
    startingDate: toLocal(e.startingDate),
    endingDate: toLocal(e.endingDate),
    locationName: e.location?.name ?? '',
    latitude: e.location?.latitude ?? null,
    longitude: e.location?.longitude ?? null,
  }
}

function buildLocation(form: EventFormState) {
  if (!form.locationName.trim()) return null
  return {
    name: form.locationName.trim(),
    latitude: form.latitude,
    longitude: form.longitude,
  }
}

export default function EventModal(props: Props) {
  const currentEvent = isEdit(props) ? props.event : null
  const isCreate = props.mode === 'create'

  const baseDate = !isEdit(props) ? props.baseDate : undefined
  const [form, setForm] = useState<EventFormState>(currentEvent ? eventToForm(currentEvent) : buildEmptyForm(baseDate))
  const [errors, setErrors] = useState<EventFormErrors>({})
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [removeBanner, setRemoveBanner] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const existingBannerURL = !removeBanner && !bannerFile ? (currentEvent?.bannerURL ?? null) : null

  function handleChange(patch: Partial<EventFormState>) {
    setForm(prev => ({ ...prev, ...patch }))
    setErrors(prev => {
      const next = { ...prev }
      for (const k of Object.keys(patch) as (keyof EventFormErrors)[]) delete next[k]
      return next
    })
  }

  function hasErrors(errs: EventFormErrors) {
    return Object.values(errs).some(Boolean)
  }

  async function handleCreate() {
    const errs = validateEventForm(form)
    setErrors(errs)
    if (hasErrors(errs)) return
    setSubmitting(true)
    try {
      const dto = {
        type: form.type,
        name: form.name.trim(),
        description: form.description.trim() || null,
        startingDate: new Date(form.startingDate).toISOString(),
        endingDate: new Date(form.endingDate).toISOString(),
        location: buildLocation(form),
      }
      const created = await EventService.create(dto, bannerFile)
      toast.success('Evento creado exitosamente')
      props.onSaved(created)
      props.onClose()
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data?.message ?? 'Error al crear el evento') : 'Error al crear el evento'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate() {
    if (!currentEvent) return
    const errs = validateEventForm(form)
    setErrors(errs)
    if (hasErrors(errs)) return
    setSubmitting(true)
    try {
      const dto = {
        type: form.type,
        name: form.name.trim(),
        description: form.description.trim() || null,
        startingDate: new Date(form.startingDate).toISOString(),
        endingDate: new Date(form.endingDate).toISOString(),
        location: buildLocation(form),
      }
      const updated = await EventService.update(currentEvent.id, dto, bannerFile, removeBanner)
      toast.success('Evento actualizado exitosamente')
      props.onSaved(updated)
      props.onClose()
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data?.message ?? 'Error al actualizar el evento') : 'Error al actualizar el evento'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!currentEvent) return
    setSubmitting(true)
    try {
      await EventService.remove(currentEvent.id)
      toast.success('Evento eliminado')
      props.onSaved(null)
      props.onClose()
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data?.message ?? 'Error al eliminar el evento') : 'Error al eliminar el evento'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const title = isCreate ? 'Nuevo Evento' : (form.name.trim() || (currentEvent?.name ?? ''))

  return (
    <>
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && props.onClose()}>
        <div className="modal-box modal-box-wide modal-form-container">
          {/* Header */}
          <div className="modal-form-header">
            <span className="modal-title">{title}</span>
            <button className="modal-close-btn" onClick={props.onClose} title="Cerrar">
              <X size={14} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="modal-form-scroll">
            <EventForm
              form={form}
              errors={errors}
              onChange={handleChange}
              bannerFile={bannerFile}
              onBannerChange={setBannerFile}
              existingBannerURL={existingBannerURL}
              removeBanner={removeBanner}
              onRemoveBanner={setRemoveBanner}
            />
          </div>

          {/* Footer */}
          {isCreate && (
            <div className="modal-form-footer">
              <button type="button" className="btn btn-ghost" onClick={props.onClose} disabled={submitting}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={submitting}>
                {submitting ? <><Loader2 size={13} className="spin-icon" />Creando...</> : 'Crear'}
              </button>
            </div>
          )}
          {!isCreate && (
            <div className="modal-form-footer" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)} disabled={submitting}>
                <Trash2 size={13} /> Eliminar
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={props.onClose} disabled={submitting}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleUpdate} disabled={submitting}>
                  {submitting ? <><Loader2 size={13} className="spin-icon" />Guardando...</> : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && currentEvent && (
        <ConfirmActionModal
          title="Eliminar evento"
          message={`¿Estás seguro que querés eliminar "${currentEvent.name}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={handleDelete}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}
