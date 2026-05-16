import '@uiw/react-md-editor/markdown-editor.css'
import { useState } from 'react'
import { X, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import type { PostDTO } from '@ubes/types'
import PostService from '@/services/postService'
import ConfirmActionModal from '@/components/ConfirmActionModal'
import PostForm, { type PostFormState, type PostFormErrors, validatePostForm } from './PostForm'

type Props =
  | { mode: 'create'; onClose: () => void; onSaved: (post: PostDTO | null) => void }
  | { mode: 'edit'; post: PostDTO; onClose: () => void; onSaved: (post: PostDTO | null) => void }

function buildEmptyForm(): PostFormState {
  return { title: '', body: '' }
}

function postToForm(post: PostDTO): PostFormState {
  return { title: post.title, body: post.body }
}

export default function PostModal(props: Props) {
  const isCreate = props.mode === 'create'
  const currentPost = isCreate ? null : props.post

  const [form, setForm] = useState<PostFormState>(currentPost ? postToForm(currentPost) : buildEmptyForm())
  const [errors, setErrors] = useState<PostFormErrors>({})
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [removeBanner, setRemoveBanner] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const existingBannerURL = !removeBanner && !bannerFile ? (currentPost?.bannerURL ?? null) : null

  function handleChange(patch: Partial<PostFormState>) {
    setForm(prev => ({ ...prev, ...patch }))
    setErrors(prev => {
      const next = { ...prev }
      for (const k of Object.keys(patch) as (keyof PostFormErrors)[]) delete next[k]
      return next
    })
  }

  function hasErrors(errs: PostFormErrors) {
    return Object.values(errs).some(Boolean)
  }

  async function handleCreate() {
    const errs = validatePostForm(form)
    setErrors(errs)
    if (hasErrors(errs)) return
    setSubmitting(true)
    try {
      const created = await PostService.create({ title: form.title.trim(), body: form.body.trim() }, bannerFile)
      toast.success('Anuncio publicado exitosamente')
      props.onSaved(created)
      props.onClose()
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data?.message ?? 'Error al publicar el anuncio') : 'Error al publicar el anuncio'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate() {
    if (!currentPost) return
    const errs = validatePostForm(form)
    setErrors(errs)
    if (hasErrors(errs)) return
    setSubmitting(true)
    try {
      const updated = await PostService.update(currentPost.id, { title: form.title.trim(), body: form.body.trim() }, bannerFile, removeBanner)
      toast.success('Anuncio actualizado exitosamente')
      props.onSaved(updated)
      props.onClose()
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data?.message ?? 'Error al actualizar el anuncio') : 'Error al actualizar el anuncio'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!currentPost) return
    setSubmitting(true)
    try {
      await PostService.remove(currentPost.id)
      toast.success('Anuncio eliminado')
      props.onSaved(null)
      props.onClose()
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data?.message ?? 'Error al eliminar el anuncio') : 'Error al eliminar el anuncio'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const title = isCreate ? 'Nuevo Anuncio' : (form.title.trim() || (currentPost?.title ?? ''))

  return (
    <>
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && props.onClose()}>
        <div className="modal-box modal-box-xl modal-form-container post-modal">
          {/* Header */}
          <div className="modal-form-header">
            <span className="modal-title">{title}</span>
            {isCreate && (
              <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={submitting} style={{ flexShrink: 0 }}>
                {submitting ? <><Loader2 size={13} className="spin-icon" />Publicando...</> : 'Publicar'}
              </button>
            )}
            <button className="modal-close-btn" onClick={props.onClose} title="Cerrar">
              <X size={14} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="modal-form-scroll">
            <PostForm
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

          {/* Footer — edit only */}
          {!isCreate && (
            <div className="modal-form-footer" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)} disabled={submitting}>
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

      {showDeleteConfirm && currentPost && (
        <ConfirmActionModal
          title="Eliminar anuncio"
          message={`¿Estás seguro que querés eliminar "${currentPost.title}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  )
}
