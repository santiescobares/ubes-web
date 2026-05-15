import { useRef, useState } from 'react'
import { UploadCloud, X, FileText, Image } from 'lucide-react'
import { toast } from 'sonner'

interface FileDropzoneProps {
  accept: string[]
  maxSizeMB: number
  value: File | null
  onChange: (file: File | null) => void
  label: string
  hint?: string
  disabled?: boolean
}

export default function FileDropzone({ accept, maxSizeMB, value, onChange, label, hint, disabled }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function validate(file: File): boolean {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!accept.includes(ext)) {
      toast.error(`Formato no permitido. Formatos válidos: ${accept.join(', ')}`)
      return false
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`El archivo supera el límite de ${maxSizeMB} MB`)
      return false
    }
    return true
  }

  function handleFile(file: File) {
    if (validate(file)) onChange(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const isImage = value && ['png', 'jpg', 'jpeg'].includes(value.name.split('.').pop()?.toLowerCase() ?? '')

  return (
    <div
      className={`file-dropzone${dragging ? ' dragging' : ''}${disabled ? ' disabled' : ''}`}
      onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && !value && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept.map(e => `.${e}`).join(',')}
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
        disabled={disabled}
      />

      {value ? (
        <div className="file-dropzone-preview">
          {isImage ? (
            <Image size={18} strokeWidth={1.5} className="file-dropzone-icon" />
          ) : (
            <FileText size={18} strokeWidth={1.5} className="file-dropzone-icon" />
          )}
          <span className="file-dropzone-name">{value.name}</span>
          <button
            type="button"
            className="file-dropzone-remove"
            onClick={e => { e.stopPropagation(); onChange(null) }}
            disabled={disabled}
            aria-label="Quitar archivo"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <div className="file-dropzone-empty">
          <UploadCloud size={18} strokeWidth={1.5} className="file-dropzone-icon" />
          <span className="file-dropzone-label">{label}</span>
          {hint && <span className="file-dropzone-hint">{hint}</span>}
        </div>
      )}
    </div>
  )
}
