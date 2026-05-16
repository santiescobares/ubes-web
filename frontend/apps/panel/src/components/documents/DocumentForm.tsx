import { useRef } from 'react'
import { Pencil, ExternalLink } from 'lucide-react'
import { DocumentType } from '@ubes/types'
import { DOCUMENT_TYPE_META } from '@/lib/documentTypeMeta'
import { DOCUMENT_ACCEPT, DOCUMENT_MAX_SIZE_MB, formatFileSize } from '@/lib/documentUtils'
import FileDropzone from '@/components/ui/FileDropzone'

export interface DocumentFormState {
  name: string
  type: DocumentType
}

export interface DocumentFormErrors {
  name?: string
  type?: string
  file?: string
}

interface Props {
  form: DocumentFormState
  errors: DocumentFormErrors
  onChange: (patch: Partial<DocumentFormState>) => void
  file: File | null
  onFileChange: (f: File | null) => void
  existingFileURL?: string | null
  existingFileName?: string | null
  existingFileSize?: number | null
  isCreate: boolean
}

const SELECTABLE_TYPES = [
  DocumentType.STATUTE,
  DocumentType.REGULATION,
  DocumentType.STATEMENT,
  DocumentType.INFORMATIVE,
  DocumentType.OTHER,
] as const

export function validateDocumentForm(
  form: DocumentFormState,
  isCreate: boolean,
  file: File | null,
): DocumentFormErrors {
  const errors: DocumentFormErrors = {}
  if (!form.name.trim()) errors.name = 'El nombre es requerido'
  else if (form.name.trim().length > 50) errors.name = 'Máximo 50 caracteres'
  if (!form.type) errors.type = 'El tipo es requerido'
  if (isCreate && !file) errors.file = 'El archivo es requerido'
  return errors
}

export default function DocumentForm({
  form, errors, onChange,
  file, onFileChange,
  existingFileURL, existingFileName, existingFileSize,
  isCreate,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const showExisting = !isCreate && !!existingFileURL && !file

  return (
    <div className="form-grid">
      {/* Row 1: Name + Type */}
      <div className="event-form-name-row">
        <div className="form-field" style={{ flex: 1 }}>
          <label className="form-label">Nombre <span className="required">*</span></label>
          <input
            className={`form-input${errors.name ? ' form-input--error' : ''}`}
            type="text"
            placeholder="Nombre del documento"
            value={form.name}
            onChange={e => onChange({ name: e.target.value })}
            maxLength={50}
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>
        <div className="form-field event-form-type">
          <label className="form-label">Tipo <span className="required">*</span></label>
          <select
            className={`form-input${errors.type ? ' form-input--error' : ''}`}
            value={form.type}
            onChange={e => onChange({ type: e.target.value as DocumentType })}
          >
            {SELECTABLE_TYPES.map(t => (
              <option key={t} value={t}>{DOCUMENT_TYPE_META[t].label}</option>
            ))}
          </select>
          {errors.type && <span className="form-error">{errors.type}</span>}
        </div>
      </div>

      {/* File */}
      <div className="form-field">
        <label className="form-label">Archivo <span className="required">*</span></label>
        {showExisting ? (
          <div className="cert-row">
            <span className="cert-label">{existingFileName ?? 'Archivo actual'}</span>
            {existingFileSize != null && (
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{formatFileSize(existingFileSize)}</span>
            )}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <a
                href={existingFileURL!}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: '4px 10px' }}
              >
                <ExternalLink size={12} /> Ver
              </a>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: '4px 10px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Pencil size={11} /> Cambiar
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={DOCUMENT_ACCEPT.map(e => `.${e}`).join(',')}
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) onFileChange(f); e.target.value = '' }}
            />
          </div>
        ) : (
          <FileDropzone
            accept={DOCUMENT_ACCEPT}
            maxSizeMB={DOCUMENT_MAX_SIZE_MB}
            value={file}
            onChange={onFileChange}
            label="Arrastrá o hacé clic para subir un archivo"
            hint="PDF, DOC, DOCX, XLS, XLSX, PNG, JPG — máx. 25 MB"
          />
        )}
        {errors.file && <span className="form-error">{errors.file}</span>}
      </div>
    </div>
  )
}
