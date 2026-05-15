import Stepper from '@/components/ui/Stepper'
import FileDropzone from '@/components/ui/FileDropzone'
import LocationMapPicker from '@/components/competitions/LocationMapPicker'

export interface CompetitionFormState {
  name: string
  description: string
  startingDate: string
  endingDate: string
  registrationStartingDate: string
  registrationEndingDate: string
  locationName: string
  latitude: number | null
  longitude: number | null
  minParticipants: number
  maxParticipants: number
  maxCoaches: number
  requiresShirtNumbers: boolean
  requiresMedicalCertificates: boolean
  bannerFile: File | null
  regulationFile: File | null
}

export type CompetitionFormErrors = Partial<Record<keyof CompetitionFormState, string>>

interface Props {
  value: CompetitionFormState
  onChange: (next: CompetitionFormState) => void
  errors: CompetitionFormErrors
  mode: 'create' | 'edit'
  disabled?: boolean
}

export function initialCompetitionFormState(): CompetitionFormState {
  return {
    name: '',
    description: '',
    startingDate: '',
    endingDate: '',
    registrationStartingDate: '',
    registrationEndingDate: '',
    locationName: '',
    latitude: null,
    longitude: null,
    minParticipants: 0,
    maxParticipants: 1,
    maxCoaches: 0,
    requiresShirtNumbers: false,
    requiresMedicalCertificates: false,
    bannerFile: null,
    regulationFile: null,
  }
}

export default function CompetitionForm({ value, onChange, errors, mode, disabled }: Props) {
  function set<K extends keyof CompetitionFormState>(key: K, val: CompetitionFormState[K]) {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className="form-grid">
      {/* Nombre */}
      <div className="form-field">
        <label className="form-label">Nombre {mode === 'create' && <span className="required">*</span>}</label>
        <input
          className={`form-input${errors.name ? ' error' : ''}`}
          type="text"
          maxLength={50}
          value={value.name}
          onChange={e => set('name', e.target.value)}
          disabled={disabled}
          placeholder="Ej. Torneo de Fútbol 2025"
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      {/* Descripción */}
      <div className="form-field">
        <label className="form-label">Descripción</label>
        <textarea
          className={`form-textarea${errors.description ? ' error' : ''}`}
          maxLength={1000}
          value={value.description}
          onChange={e => set('description', e.target.value)}
          disabled={disabled}
          placeholder="Descripción opcional..."
        />
        {errors.description && <span className="form-error">{errors.description}</span>}
      </div>

      {/* Fechas inicio / fin */}
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Fecha de inicio {mode === 'create' && <span className="required">*</span>}</label>
          <input
            className={`form-input${errors.startingDate ? ' error' : ''}`}
            type="datetime-local"
            value={value.startingDate}
            onChange={e => set('startingDate', e.target.value)}
            disabled={disabled}
          />
          {errors.startingDate && <span className="form-error">{errors.startingDate}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Fecha de fin {mode === 'create' && <span className="required">*</span>}</label>
          <input
            className={`form-input${errors.endingDate ? ' error' : ''}`}
            type="datetime-local"
            value={value.endingDate}
            onChange={e => set('endingDate', e.target.value)}
            disabled={disabled}
          />
          {errors.endingDate && <span className="form-error">{errors.endingDate}</span>}
        </div>
      </div>

      {/* Participantes y coaches — inline */}
      <div className="stepper-inline-row">
        <div className="stepper-inline-item">
          <label className="form-label">Min. Part.</label>
          <Stepper value={value.minParticipants} onChange={v => set('minParticipants', v)} min={0} max={99} disabled={disabled} />
          {errors.minParticipants && <span className="form-error">{errors.minParticipants}</span>}
        </div>
        <div className="stepper-inline-item">
          <label className="form-label">Max. Part.</label>
          <Stepper value={value.maxParticipants} onChange={v => set('maxParticipants', v)} min={1} max={99} disabled={disabled} />
          {errors.maxParticipants && <span className="form-error">{errors.maxParticipants}</span>}
        </div>
        <div className="stepper-inline-item">
          <label className="form-label">Max. Coach.</label>
          <Stepper value={value.maxCoaches} onChange={v => set('maxCoaches', v)} min={0} max={99} disabled={disabled} />
          {errors.maxCoaches && <span className="form-error">{errors.maxCoaches}</span>}
        </div>
      </div>

      {/* Toggles */}
      <div className="toggle-row">
        <div>
          <p className="toggle-label-text">Números de camiseta</p>
          <p className="toggle-label-sub">Requiere asignar número a cada participante</p>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={value.requiresShirtNumbers}
            onChange={e => set('requiresShirtNumbers', e.target.checked)}
            disabled={disabled}
          />
          <span className="toggle-track" />
        </label>
      </div>

      <div className="toggle-row">
        <div>
          <p className="toggle-label-text">Fichas médicas</p>
          <p className="toggle-label-sub">Los participantes deben adjuntar ficha médica</p>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={value.requiresMedicalCertificates}
            onChange={e => set('requiresMedicalCertificates', e.target.checked)}
            disabled={disabled}
          />
          <span className="toggle-track" />
        </label>
      </div>

      {/* Fechas de inscripción (solo edit) */}
      {mode === 'edit' && (
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Inicio inscripciones</label>
            <input
              className="form-input"
              type="datetime-local"
              value={value.registrationStartingDate}
              onChange={e => set('registrationStartingDate', e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Fin inscripciones</label>
            <input
              className="form-input"
              type="datetime-local"
              value={value.registrationEndingDate}
              onChange={e => set('registrationEndingDate', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {/* Ubicación */}
      <div className="form-field">
        <label className="form-label">Nombre del lugar</label>
        <input
          className={`form-input${errors.locationName ? ' error' : ''}`}
          type="text"
          maxLength={100}
          value={value.locationName}
          onChange={e => set('locationName', e.target.value)}
          disabled={disabled}
          placeholder="Ej. Estadio Municipal Bell Ville"
        />
        {errors.locationName && <span className="form-error">{errors.locationName}</span>}
      </div>

      <div className="form-field">
        <label className="form-label">Ubicación en el mapa</label>
        <LocationMapPicker
          value={{ latitude: value.latitude, longitude: value.longitude }}
          onChange={({ latitude, longitude }) => onChange({ ...value, latitude, longitude })}
          disabled={disabled}
        />
        {(errors.latitude || errors.longitude) && (
          <span className="form-error">{errors.latitude ?? errors.longitude}</span>
        )}
      </div>

      {/* Archivos */}
      <div className="form-field">
        <label className="form-label">Banner</label>
        <FileDropzone
          accept={['png', 'jpg', 'jpeg']}
          maxSizeMB={10}
          value={value.bannerFile}
          onChange={f => set('bannerFile', f)}
          label="Arrastrá o hacé clic para subir banner"
          hint="PNG, JPG — máx. 10 MB"
          disabled={disabled}
        />
      </div>

      <div className="form-field">
        <label className="form-label">Reglamento</label>
        <FileDropzone
          accept={['pdf', 'doc', 'docx']}
          maxSizeMB={25}
          value={value.regulationFile}
          onChange={f => set('regulationFile', f)}
          label="Arrastrá o hacé clic para subir reglamento"
          hint="PDF, DOC, DOCX — máx. 25 MB"
          disabled={disabled}
        />
      </div>
    </div>
  )
}
