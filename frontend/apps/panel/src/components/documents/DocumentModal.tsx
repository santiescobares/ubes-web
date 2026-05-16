import { useState } from 'react'
import { X, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { DocumentType } from '@ubes/types'
import type { DocumentDTO } from '@ubes/types'
import DocumentService from '@/services/documentService'
import ConfirmActionModal from '@/components/ConfirmActionModal'
import DocumentForm, {
  type DocumentFormState,
  type DocumentFormErrors,
  validateDocumentForm,
} from './DocumentForm'

interface BaseProps {
  onClose: () => void
  onSaved: (saved: DocumentDTO | null) => void
}

interface CreateProps extends BaseProps { mode: 'create' }
interface EditProps extends BaseProps { mode: 'edit'; document: DocumentDTO }

type Props = CreateProps | EditProps

function isEdit(p: Props): p is EditProps {
  return p.mode === 'edit'
}

function buildEmptyForm(): DocumentFormState {
  return { name: '', type: DocumentType.OTHER }
}

function documentToForm(d: DocumentDTO): DocumentFormState {
  return { name: d.name, type: d.type }
}

export default function DocumentModal(props: Props) {
  const currentDocument = isEdit(props) ? props.document : null
  const isCreate = props.mode === 'create'

  const [form, setForm] = useState<DocumentFormState>(
    currentDocument ? documentToForm(currentDocument) : buildEmptyForm(),
  )
  const [errors, setErrors] = useState<DocumentFormErrors>({})
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleChange(patch: Partial<DocumentFormState>) {
    setForm(prev => ({ ...prev, ...patch }))
    setErrors(prev => {
      const next = { ...prev }
      for (const k of Object.keys(patch) as (keyof DocumentFormErrors)[]) delete next[k]
      return next
    })
  }

  function hasErrors(errs: DocumentFormErrors) {
    return Object.values(errs).some(Boolean)
  }

  async function handleCreate() {
    const errs = validateDocumentForm(form, true, file)
    setErrors(errs)
    if (hasErrors(errs)) return
    setSubmitting(true)
    try {
      const dto = { name: form.name.trim(), type: form.type }
      const created = await DocumentService.create(dto, file!)
      toast.success('Documento creado exitosamente')
      props.onSaved(created)
      props.onClose()
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data?.message ?? 'Error al crear el documento')
        : 'Error al crear el documento'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate() {
    if (!currentDocument) return
    const errs = validateDocumentForm(form, false, file)
    setErrors(errs)
    if (hasErrors(errs)) return
    setSubmitting(true)
    try {
      const dto = { name: form.name.trim(), type: form.type }
      const updated = await DocumentService.update(currentDocument.id, dto, file)
      toast.success('Documento actualizado exitosamente')
      props.onSaved(updated)
      props.onClose()
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data?.message ?? 'Error al actualizar el documento')
        : 'Error al actualizar el documento'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!currentDocument) return
    setSubmitting(true)
    try {
      await DocumentService.remove(currentDocument.id)
      toast.success('Documento eliminado')
      props.onSaved(null)
      props.onClose()
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data?.message ?? 'Error al eliminar el documento')
        : 'Error al eliminar el documento'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const title = isCreate ? 'Nuevo Documento' : (form.name.trim() || (currentDocument?.name ?? ''))

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
            <DocumentForm
              form={form}
              errors={errors}
              onChange={handleChange}
              file={file}
              onFileChange={f => { setFile(f); setErrors(prev => ({ ...prev, file: undefined })) }}
              existingFileURL={currentDocument?.url ?? null}
              existingFileName={currentDocument?.name ?? null}
              existingFileSize={currentDocument?.size ?? null}
              isCreate={isCreate}
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
                  {submitting ? <><Loader2 size={13} className="spin-icon" />Guardando...</> : 'Guardar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && currentDocument && (
        <ConfirmActionModal
          title="Eliminar documento"
          message={`¿Estás seguro que querés eliminar "${currentDocument.name}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={handleDelete}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}
