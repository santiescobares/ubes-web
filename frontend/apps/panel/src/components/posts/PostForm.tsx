import { useRef } from 'react'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'
import FileDropzone from '@/components/ui/FileDropzone'

export interface PostFormState {
  title: string
  body: string
}

export interface PostFormErrors {
  title?: string
  body?: string
}

interface Props {
  form: PostFormState
  errors: PostFormErrors
  onChange: (patch: Partial<PostFormState>) => void
  bannerFile: File | null
  onBannerChange: (file: File | null) => void
  existingBannerURL?: string | null
  removeBanner: boolean
  onRemoveBanner: (v: boolean) => void
}

export function validatePostForm(form: PostFormState): PostFormErrors {
  const errors: PostFormErrors = {}
  if (!form.title.trim()) errors.title = 'El título es requerido'
  else if (form.title.length > 100) errors.title = 'Máximo 100 caracteres'
  if (!form.body.trim()) errors.body = 'El contenido es requerido'
  else if (form.body.length < 10) errors.body = 'Mínimo 10 caracteres'
  else if (form.body.length > 10000) errors.body = 'Máximo 10000 caracteres'
  return errors
}

export default function PostForm({
  form, errors, onChange,
  bannerFile, onBannerChange,
  existingBannerURL, removeBanner, onRemoveBanner,
}: Props) {
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const showBannerPreview = !removeBanner && !!existingBannerURL && !bannerFile

  return (
    <div className="form-grid">
      {/* Title */}
      <div className="form-field">
        <label className="form-label">Título <span className="required">*</span></label>
        <input
          className={`form-input${errors.title ? ' form-input--error' : ''}`}
          type="text"
          placeholder="Título del anuncio"
          value={form.title}
          onChange={e => onChange({ title: e.target.value })}
          maxLength={100}
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      {/* Body */}
      <div className="form-field">
        <label className="form-label">Contenido <span className="required">*</span></label>
        <div data-color-mode="light">
          <MDEditor
            value={form.body}
            onChange={v => onChange({ body: (v ?? '').slice(0, 10000) })}
            height={400}
            preview="edit"
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {errors.body
            ? <span className="form-error">{errors.body}</span>
            : <span />
          }
          <span style={{ fontSize: 11, color: 'var(--muted-light)' }}>{form.body.length} / 10000</span>
        </div>
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
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => bannerInputRef.current?.click()}>
                <Pencil size={11} /> Cambiar
              </button>
              {showBannerPreview && (
                <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px', color: 'var(--red-strong)' }} onClick={() => onRemoveBanner(true)}>
                  <Trash2 size={11} />
                </button>
              )}
            </div>
            <input ref={bannerInputRef} type="file" accept=".png,.jpg,.jpeg,.webp" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) { onBannerChange(f); onRemoveBanner(false) }; e.target.value = '' }} />
          </div>
        ) : (
          <FileDropzone
            accept={['png', 'jpg', 'jpeg', 'webp']}
            maxSizeMB={5}
            value={bannerFile}
            onChange={onBannerChange}
            label="Arrastrá o hacé clic para subir banner"
            hint="PNG, JPG — máx. 5 MB"
          />
        )}
      </div>
    </div>
  )
}
