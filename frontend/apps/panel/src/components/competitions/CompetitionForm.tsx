import { Upload, Trash2, MapPin, Minus, Plus, Settings, FileText } from 'lucide-react'

export interface CompetitionFormState {
  name: string
  description: string
  startingDate: string
  endingDate: string
  locationName: string
  minParticipants: number
  maxParticipants: number
  maxCoaches: number
  requiresShirtNumbers: boolean
  requiresMedicalCertificates: boolean
  registrationStartingDate?: string
  registrationEndingDate?: string
}

export const COMPETITION_FORM_INITIAL: CompetitionFormState = {
  name: '',
  description: '',
  startingDate: '',
  endingDate: '',
  locationName: '',
  minParticipants: 1,
  maxParticipants: 10,
  maxCoaches: 2,
  requiresShirtNumbers: false,
  requiresMedicalCertificates: false,
  registrationStartingDate: '',
  registrationEndingDate: '',
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

interface Props {
  value: CompetitionFormState
  onChange: (v: CompetitionFormState) => void
  errors?: Partial<Record<keyof CompetitionFormState, string>>
  bannerFile: File | null
  setBannerFile: (f: File | null) => void
  regulationFile: File | null
  setRegulationFile: (f: File | null) => void
  disabled?: boolean
  showRegistrationDates?: boolean
  existingBannerURL?: string
  removeBanner?: boolean
  onRemoveBanner?: () => void
}

export default function CompetitionForm({
  value: form,
  onChange,
  errors = {},
  bannerFile,
  setBannerFile,
  regulationFile,
  setRegulationFile,
  disabled = false,
  showRegistrationDates = false,
  existingBannerURL,
  removeBanner = false,
  onRemoveBanner,
}: Props) {
  function set<K extends keyof CompetitionFormState>(key: K, val: CompetitionFormState[K]) {
    onChange({ ...form, [key]: val })
  }

  return (
    <div className="form-grid">

      {/* Nombre */}
      <div className="form-field">
        <label className="form-label">Nombre <span className="required">*</span></label>
        <input
          className={`form-input${errors.name ? ' error' : ''}`}
          type="text"
          placeholder="Ej: Fútbol 5 Masculino 2026"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          disabled={disabled}
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      {/* Descripción */}
      <div className="form-field">
        <label className="form-label">Descripción</label>
        <textarea
          className={`form-textarea${errors.description ? ' error' : ''}`}
          placeholder="Descripción breve de la competencia..."
          value={form.description}
          onChange={e => set('description', e.target.value)}
          disabled={disabled}
          rows={3}
        />
        {errors.description && <span className="form-error">{errors.description}</span>}
      </div>

      {/* Fechas */}
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Fecha de inicio <span className="required">*</span></label>
          <input
            className={`form-input${errors.startingDate ? ' error' : ''}`}
            type="datetime-local"
            value={form.startingDate}
            onChange={e => set('startingDate', e.target.value)}
            disabled={disabled}
          />
          {errors.startingDate && <span className="form-error">{errors.startingDate}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Fecha de fin</label>
          <input
            className={`form-input${errors.endingDate ? ' error' : ''}`}
            type="datetime-local"
            value={form.endingDate}
            onChange={e => set('endingDate', e.target.value)}
            disabled={disabled}
          />
          {errors.endingDate && <span className="form-error">{errors.endingDate}</span>}
        </div>
      </div>

      {/* Min / Max participantes */}
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Mín. participantes <span className="required">*</span></label>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 6 }}>
            <button
              type="button"
              className="stepper-btn"
              onClick={() => set('minParticipants', clamp(form.minParticipants - 1, 1, form.maxParticipants))}
              disabled={disabled || form.minParticipants <= 1}
            >
              <Minus size={13} />
            </button>
            <input
              className={`form-input${errors.minParticipants ? ' error' : ''}`}
              type="number"
              min={1}
              value={form.minParticipants}
              onChange={e => set('minParticipants', clamp(Number(e.target.value), 1, form.maxParticipants))}
              disabled={disabled}
              style={{ textAlign: 'center', width: 64, flex: 'none' }}
            />
            <button
              type="button"
              className="stepper-btn"
              onClick={() => set('minParticipants', clamp(form.minParticipants + 1, 1, form.maxParticipants))}
              disabled={disabled || form.minParticipants >= form.maxParticipants}
            >
              <Plus size={13} />
            </button>
          </div>
          {errors.minParticipants && <span className="form-error">{errors.minParticipants}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Máx. participantes <span className="required">*</span></label>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 6 }}>
            <button
              type="button"
              className="stepper-btn"
              onClick={() => set('maxParticipants', clamp(form.maxParticipants - 1, form.minParticipants, 9999))}
              disabled={disabled || form.maxParticipants <= form.minParticipants}
            >
              <Minus size={13} />
            </button>
            <input
              className={`form-input${errors.maxParticipants ? ' error' : ''}`}
              type="number"
              min={form.minParticipants}
              value={form.maxParticipants}
              onChange={e => set('maxParticipants', clamp(Number(e.target.value), form.minParticipants, 9999))}
              disabled={disabled}
              style={{ textAlign: 'center', width: 64, flex: 'none' }}
            />
            <button
              type="button"
              className="stepper-btn"
              onClick={() => set('maxParticipants', form.maxParticipants + 1)}
              disabled={disabled}
            >
              <Plus size={13} />
            </button>
          </div>
          {errors.maxParticipants && <span className="form-error">{errors.maxParticipants}</span>}
        </div>
      </div>

      {/* Max cuerpo técnico */}
      <div className="form-field" style={{ maxWidth: 220 }}>
        <label className="form-label">Máx. cuerpo técnico</label>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 6 }}>
          <button
            type="button"
            className="stepper-btn"
            onClick={() => set('maxCoaches', clamp(form.maxCoaches - 1, 0, 99))}
            disabled={disabled || form.maxCoaches <= 0}
          >
            <Minus size={13} />
          </button>
          <input
            className={`form-input${errors.maxCoaches ? ' error' : ''}`}
            type="number"
            min={0}
            value={form.maxCoaches}
            onChange={e => set('maxCoaches', clamp(Number(e.target.value), 0, 99))}
            disabled={disabled}
            style={{ textAlign: 'center', width: 64, flex: 'none' }}
          />
          <button
            type="button"
            className="stepper-btn"
            onClick={() => set('maxCoaches', clamp(form.maxCoaches + 1, 0, 99))}
            disabled={disabled || form.maxCoaches >= 99}
          >
            <Plus size={13} />
          </button>
        </div>
        {errors.maxCoaches && <span className="form-error">{errors.maxCoaches}</span>}
      </div>

      {/* Toggles */}
      <div className="toggle-row">
        <div>
          <div className="toggle-label-text">Números de camiseta</div>
          <div className="toggle-label-sub">Los participantes tendrán número asignado</div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={form.requiresShirtNumbers}
            onChange={e => set('requiresShirtNumbers', e.target.checked)}
            disabled={disabled}
          />
          <span className="toggle-track" />
        </label>
      </div>

      <div className="toggle-row">
        <div>
          <div className="toggle-label-text">Ficha médica obligatoria</div>
          <div className="toggle-label-sub">Se requerirá certificado médico para inscribirse</div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={form.requiresMedicalCertificates}
            onChange={e => set('requiresMedicalCertificates', e.target.checked)}
            disabled={disabled}
          />
          <span className="toggle-track" />
        </label>
      </div>

      {/* Ubicación */}
      <div className="form-field">
        <label className="form-label">Ubicación</label>
        {/* Placeholder para futura integración con OpenStreetMap */}
        <div style={{
          height: 160,
          border: '1px dashed rgba(0,0,0,0.18)',
          borderRadius: 8,
          background: 'rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          color: 'var(--muted)',
          fontSize: 12,
        }}>
          <MapPin size={20} style={{ opacity: 0.3 }} />
          <span style={{ opacity: 0.5 }}>Mapa interactivo — próximamente</span>
        </div>
      </div>

      <div className="form-field">
        <input
          className={`form-input${errors.locationName ? ' error' : ''}`}
          type="text"
          placeholder="Nombre del lugar..."
          value={form.locationName}
          onChange={e => set('locationName', e.target.value)}
          disabled={disabled}
        />
        {errors.locationName && <span className="form-error">{errors.locationName}</span>}
      </div>

      {/* Banner */}
      <div className="form-field">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <label className="form-label" style={{ margin: 0 }}>Banner</label>
          {bannerFile && (
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setBannerFile(null)}
              title="Quitar banner"
              disabled={disabled}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {existingBannerURL && !bannerFile && !removeBanner ? (
          <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
            <img
              src={existingBannerURL}
              alt="Banner actual"
              style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
              <label
                title="Cambiar banner"
                style={{ cursor: disabled ? 'not-allowed' : 'pointer', background: 'rgba(0,0,0,0.55)', borderRadius: 6, padding: '4px 6px', display: 'flex', alignItems: 'center' }}
              >
                <Settings size={13} style={{ color: '#fff' }} />
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  disabled={disabled}
                  onChange={e => setBannerFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <button
                type="button"
                title="Eliminar banner"
                onClick={onRemoveBanner}
                disabled={disabled}
                style={{ background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Trash2 size={13} style={{ color: '#fff' }} />
              </button>
            </div>
          </div>
        ) : (
          <label className="file-input-label" style={{ flexDirection: 'column', gap: 6, padding: '20px 12px', justifyContent: 'center' }}>
            <Upload size={16} style={{ opacity: 0.5 }} />
            {bannerFile ? (
              <span className="file-selected" style={{ fontSize: 12 }}>{bannerFile.name}</span>
            ) : (
              <span style={{ fontSize: 12 }}>Seleccionar o arrastrar imagen</span>
            )}
            <input
              type="file"
              accept="image/*"
              disabled={disabled}
              onChange={e => setBannerFile(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
        <span className="form-hint">JPG, PNG, WebP — máx. 10 MB</span>
      </div>

      {/* Reglamento */}
      <div className="form-field">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <label className="form-label" style={{ margin: 0 }}>Reglamento</label>
          {regulationFile && (
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setRegulationFile(null)}
              title="Quitar reglamento"
              disabled={disabled}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
        <label className="file-input-label" style={{ flexDirection: 'column', gap: 6, padding: '16px 12px', justifyContent: 'center' }}>
          <FileText size={16} style={{ opacity: 0.5 }} />
          {regulationFile ? (
            <span className="file-selected" style={{ fontSize: 12 }}>{regulationFile.name}</span>
          ) : (
            <span style={{ fontSize: 12 }}>Seleccionar documento</span>
          )}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            disabled={disabled}
            onChange={e => setRegulationFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <span className="form-hint">PDF, DOC, DOCX — opcional</span>
      </div>

      {/* Fechas de inscripción (opcional) */}
      {showRegistrationDates && (
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Fecha Inicio Reg.</label>
            <input
              className={`form-input${errors.registrationStartingDate ? ' error' : ''}`}
              type="datetime-local"
              value={form.registrationStartingDate ?? ''}
              onChange={e => onChange({ ...form, registrationStartingDate: e.target.value })}
              disabled={disabled}
            />
            {errors.registrationStartingDate && <span className="form-error">{errors.registrationStartingDate}</span>}
          </div>
          <div className="form-field">
            <label className="form-label">Fecha Fin Reg.</label>
            <input
              className={`form-input${errors.registrationEndingDate ? ' error' : ''}`}
              type="datetime-local"
              value={form.registrationEndingDate ?? ''}
              onChange={e => onChange({ ...form, registrationEndingDate: e.target.value })}
              disabled={disabled}
            />
            {errors.registrationEndingDate && <span className="form-error">{errors.registrationEndingDate}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
