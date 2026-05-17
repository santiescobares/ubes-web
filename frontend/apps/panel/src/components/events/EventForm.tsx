import { useRef } from 'react'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import { EventType } from '@ubes/types'
import { EVENT_TYPE_META } from '@/lib/eventTypeMeta'
import LocationMapPicker from '@/components/competitions/LocationMapPicker'
import FileDropzone from '@/components/ui/FileDropzone'

export interface EventFormState {
  name: string
  type: EventType
  description: string
  startingDate: string
  endingDate: string
  locationName: string
  latitude: number | null
  longitude: number | null
}

export interface EventFormErrors {
  name?: string
  type?: string
  description?: string
  startingDate?: string
  endingDate?: string
  locationName?: string
}

interface Props {
  form: EventFormState
  errors: EventFormErrors
  onChange: (patch: Partial<EventFormState>) => void
  bannerFile: File | null
  onBannerChange: (file: File | null) => void
  existingBannerURL?: string | null
  removeBanner: boolean
  onRemoveBanner: (v: boolean) => void
  readOnly?: boolean
}

// Event types available for selection (COMPETITION managed separately)
const SELECTABLE_TYPES = [
  EventType.SPECIAL,
  EventType.PARTY,
  EventType.NATIONAL_EVENT,
  EventType.OTHER,
] as const

export function validateEventForm(form: EventFormState): EventFormErrors {
  const errors: EventFormErrors = {}
  if (!form.name.trim()) errors.name = 'El nombre es requerido'
  else if (form.name.length > 50) errors.name = 'Máximo 50 caracteres'
  if (!form.type) errors.type = 'El tipo es requerido'
  if (form.description.length > 1000) errors.description = 'Máximo 1000 caracteres'
  if (!form.startingDate) errors.startingDate = 'La fecha de inicio es requerida'
  if (!form.endingDate) errors.endingDate = 'La fecha de fin es requerida'
  else if (form.startingDate && form.endingDate < form.startingDate)
    errors.endingDate = 'La fecha de fin debe ser igual o posterior al inicio'
  if (form.locationName.length > 100) errors.locationName = 'Máximo 100 caracteres'
  return errors
}

export default function EventForm({
  form, errors, onChange,
  bannerFile, onBannerChange,
  existingBannerURL, removeBanner, onRemoveBanner,
  readOnly = false,
}: Props) {
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const showBannerPreview = !removeBanner && !!existingBannerURL && !bannerFile

  return (
    <div className="form-grid">
      {/* Row 1: Name + Type */}
      <div className="event-form-name-row">
        <div className="form-field" style={{ flex: 1 }}>
          <label className="form-label">Nombre {!readOnly && <span className="required">*</span>}</label>
          <input
            className={`form-input${errors.name ? ' form-input--error' : ''}`}
            type="text"
            placeholder="Nombre del evento"
            value={form.name}
            onChange={e => onChange({ name: e.target.value })}
            maxLength={50}
            readOnly={readOnly}
            disabled={readOnly}
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>
        <div className="form-field event-form-type">
          <label className="form-label">Tipo</label>
          {readOnly ? (
            <input
              className="form-input"
              type="text"
              value={EVENT_TYPE_META[form.type]?.label ?? form.type}
              readOnly
              disabled
            />
          ) : (
            <select
              className={`form-input${errors.type ? ' form-input--error' : ''}`}
              value={form.type}
              onChange={e => onChange({ type: e.target.value as EventType })}
            >
              {SELECTABLE_TYPES.map(t => (
                <option key={t} value={t}>{EVENT_TYPE_META[t].label}</option>
              ))}
            </select>
          )}
          {errors.type && <span className="form-error">{errors.type}</span>}
        </div>
      </div>

      {/* Description */}
      <div className="form-field">
        <label className="form-label">Descripción</label>
        <textarea
          className={`form-input form-textarea${errors.description ? ' form-input--error' : ''}`}
          placeholder="Descripción opcional..."
          value={form.description}
          onChange={e => onChange({ description: e.target.value })}
          rows={3}
          maxLength={1000}
          readOnly={readOnly}
          disabled={readOnly}
        />
        {errors.description && <span className="form-error">{errors.description}</span>}
      </div>

      {/* Dates */}
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Fecha de inicio {!readOnly && <span className="required">*</span>}</label>
          <input
            className={`form-input${errors.startingDate ? ' form-input--error' : ''}`}
            type="datetime-local"
            value={form.startingDate}
            onChange={e => onChange({ startingDate: e.target.value })}
            readOnly={readOnly}
            disabled={readOnly}
          />
          {errors.startingDate && <span className="form-error">{errors.startingDate}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Fecha de fin {!readOnly && <span className="required">*</span>}</label>
          <input
            className={`form-input${errors.endingDate ? ' form-input--error' : ''}`}
            type="datetime-local"
            value={form.endingDate}
            onChange={e => onChange({ endingDate: e.target.value })}
            readOnly={readOnly}
            disabled={readOnly}
          />
          {errors.endingDate && <span className="form-error">{errors.endingDate}</span>}
        </div>
      </div>

      {/* Map */}
      <div className="form-field">
        <label className="form-label">Ubicación en el mapa</label>
        <LocationMapPicker
          value={{ latitude: form.latitude, longitude: form.longitude }}
          onChange={({ latitude, longitude }) => onChange({ latitude, longitude })}
          disabled={readOnly}
        />
      </div>

      {/* Location name */}
      <div className="form-field">
        <label className="form-label">Nombre del lugar</label>
        <input
          className={`form-input${errors.locationName ? ' form-input--error' : ''}`}
          type="text"
          placeholder="Ej: Polideportivo Municipal"
          value={form.locationName}
          onChange={e => onChange({ locationName: e.target.value })}
          maxLength={100}
          readOnly={readOnly}
          disabled={readOnly}
        />
        {errors.locationName && <span className="form-error">{errors.locationName}</span>}
      </div>

      {/* Banner */}
      <div className="form-field">
        <label className="form-label">Banner</label>
        {showBannerPreview || bannerFile ? (
          <div className="cert-row">
            <span className="cert-label">Banner</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {showBannerPreview ? (
                <a href={existingBannerURL!} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
                  <ExternalLink size={12} /> Ver
                </a>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{bannerFile!.name}</span>
              )}
              {!readOnly && (
                <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => bannerInputRef.current?.click()}>
                  <Pencil size={11} /> Cambiar
                </button>
              )}
              {!readOnly && showBannerPreview && (
                <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px', color: 'var(--red-strong)' }} onClick={() => onRemoveBanner(true)}>
                  <Trash2 size={11} />
                </button>
              )}
            </div>
            {!readOnly && (
              <input ref={bannerInputRef} type="file" accept=".png,.jpg,.jpeg,.webp" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) { onBannerChange(f); onRemoveBanner(false) }; e.target.value = '' }} />
            )}
          </div>
        ) : readOnly ? (
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Sin banner</span>
        ) : (
          <FileDropzone
            accept={['png', 'jpg', 'jpeg', 'webp']}
            maxSizeMB={5}
            value={bannerFile}
            onChange={onBannerChange}
            label="Arrastrá o hacé clic para subir banner"
            hint="PNG, JPG — máx. 10 MB"
          />
        )}
      </div>
    </div>
  )
}
