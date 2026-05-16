import { useEffect, useState } from 'react'
import { X, Trash2, Loader2, Plus, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import type { PunishmentDTO, UserDTO } from '@ubes/types'
import { Role } from '@ubes/types'
import { formatDateTime } from '@/lib/dateUtils'
import { UserService } from '@/services/userService'
import { PunishmentService } from '@/services/punishmentService'
import { useAuthStore } from '@/store/authStore'
import { getRoleRank } from '@/lib/roleUtils'
import ConfirmActionModal from '@/components/ConfirmActionModal'
import UserForm, {
  type UserFormState,
  type UserFormErrors,
  validateUserForm,
} from './UserForm'
import UserPunishmentCard from './UserPunishmentCard'
import NewPunishmentModal from './NewPunishmentModal'

interface Props {
  user: UserDTO
  onClose: () => void
  onSaved: (updated: UserDTO) => void
}

export default function UserModal({ user, onClose, onSaved }: Props) {
  const viewer = useAuthStore((s) => s.user)
  const isReadonly = viewer ? getRoleRank(user.role) >= getRoleRank(viewer.role) : true

  const initial: UserFormState = {
    firstName: user.firstName,
    lastName: user.lastName,
    school: user.school,
    role: user.role,
  }

  const [form, setForm] = useState<UserFormState>(initial)
  const [errors, setErrors] = useState<UserFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [pictureURL, setPictureURL] = useState<string | null>(user.pictureURL)
  const [showDeletePicture, setShowDeletePicture] = useState(false)
  const [showPicturePreview, setShowPicturePreview] = useState(false)

  const [punishments, setPunishments] = useState<PunishmentDTO[]>([])
  const [punPage, setPunPage] = useState(0)
  const [punTotalPages, setPunTotalPages] = useState(1)
  const [punFetchKey, setPunFetchKey] = useState(0)
  const [punLoading, setPunLoading] = useState(false)
  const [showNewPunishment, setShowNewPunishment] = useState(false)

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial)

  useEffect(() => {
    let cancelled = false
    setPunLoading(true)
    PunishmentService.listByTarget(user.id, punPage, 3)
      .then((data) => {
        if (!cancelled) {
          setPunishments(data.content)
          setPunTotalPages(data.totalPages || 1)
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPunLoading(false) })
    return () => { cancelled = true }
  }, [user.id, punPage, punFetchKey])

  function handleChange(patch: Partial<UserFormState>) {
    setForm((prev) => ({ ...prev, ...patch }))
    setErrors((prev) => {
      const next = { ...prev }
      for (const k of Object.keys(patch) as (keyof UserFormErrors)[]) delete next[k]
      return next
    })
  }

  async function handleSave() {
    const errs = validateUserForm(form)
    setErrors(errs)
    if (Object.values(errs).some(Boolean)) return
    setSubmitting(true)
    try {
      const updated = await UserService.update(user.id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        school: form.school as UserDTO['school'],
        role: form.role as Role,
      })
      toast.success('Usuario actualizado')
      onSaved(updated)
      onClose()
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data?.message ?? 'Error al actualizar el usuario')
        : 'Error al actualizar el usuario'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeletePicture() {
    try {
      await UserService.deletePicture(user.id)
      setPictureURL(null)
      toast.success('Foto eliminada')
    } catch {
      toast.error('Error al eliminar la foto')
    }
  }

  function copyId() {
    navigator.clipboard.writeText(user.id)
    toast.success('ID copiado')
  }

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()

  return (
    <>
      <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-box user-modal" style={{ paddingBottom: 16 }}>
          {/* Close button - absolutely positioned at top */}
          <button
            className="modal-close-btn"
            onClick={onClose}
            title="Cerrar"
            style={{ position: 'absolute', top: 14, right: 14 }}
          >
            <X size={14} />
          </button>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4, paddingRight: 28 }}>
            <div style={{ minWidth: 0 }}>
              <div className="modal-title" style={{ lineHeight: 1.2 }}>
                {form.lastName || user.lastName}, {form.firstName || user.firstName}
              </div>
              <div style={{ marginTop: 5, fontSize: 11, color: 'var(--muted)' }}>
                Ingresó el {formatDateTime(user.createdAt)}
              </div>
              <div
                className="user-modal-id-pill"
                onClick={copyId}
                title="Copiar ID"
              >
                {user.id}
              </div>
            </div>

            {/* Avatar */}
            <div
              className="user-modal-avatar"
              style={{ flexShrink: 0, cursor: pictureURL ? 'pointer' : 'default' }}
              onClick={() => pictureURL && setShowPicturePreview(true)}
            >
              {pictureURL ? (
                <img src={pictureURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>{initials}</span>
              )}
              {pictureURL && (
                <div className="user-modal-avatar-overlay">
                  <Pencil size={16} color="white" />
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div style={{ marginTop: 18 }}>
            <UserForm form={form} errors={errors} email={user.email} disabled={isReadonly} onChange={handleChange} />
          </div>

          {/* Punishment history */}
          <div style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Historial de Sanciones
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '2px 6px', fontSize: 12 }}
                  disabled={punPage === 0}
                  onClick={() => setPunPage((p) => p - 1)}
                >
                  <ChevronLeft size={13} />
                </button>
                <span style={{ fontSize: 11, color: 'var(--muted-light)', minWidth: 36, textAlign: 'center' }}>
                  {punTotalPages === 0 ? '0/0' : `${punPage + 1}/${punTotalPages}`}
                </span>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '2px 6px', fontSize: 12 }}
                  disabled={punPage >= punTotalPages - 1}
                  onClick={() => setPunPage((p) => p + 1)}
                >
                  <ChevronRight size={13} />
                </button>
                {!isReadonly && (
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '2px 6px', fontSize: 12 }}
                    title="Nueva sanción"
                    onClick={() => setShowNewPunishment(true)}
                  >
                    <Plus size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="punishment-list">
              {punLoading ? (
                <p style={{ fontSize: 12, color: 'var(--muted-light)', padding: '8px 0' }}>Cargando...</p>
              ) : punishments.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--muted-light)', padding: '8px 0' }}>Sin sanciones registradas.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {punishments.map((p) => (
                    <UserPunishmentCard
                      key={p.id}
                      punishment={p}
                      onRefresh={() => setPunFetchKey((k) => k + 1)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          {!isReadonly && (
            <div className="modal-form-footer" style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-ghost" onClick={onClose} disabled={submitting}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!isDirty || submitting}
              >
                {submitting ? <><Loader2 size={13} className="spin-icon" />Guardando...</> : 'Guardar'}
              </button>
            </div>
          )}
        </div>
      </div>

      {showPicturePreview && pictureURL && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 1100 }}
          onClick={(e) => e.target === e.currentTarget && setShowPicturePreview(false)}
        >
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <img
              src={pictureURL}
              alt="Foto de perfil"
              style={{ maxWidth: 'min(480px, 90vw)', maxHeight: '80vh', borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.4)', objectFit: 'contain' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)' }} onClick={() => setShowPicturePreview(false)}>
                Cerrar
              </button>
              <button
                className="btn btn-danger"
                style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                onClick={() => { setShowPicturePreview(false); setShowDeletePicture(true) }}
              >
                <Trash2 size={13} /> Eliminar foto
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeletePicture && (
        <ConfirmActionModal
          title="Eliminar foto de perfil"
          message="¿Estás seguro que querés eliminar la foto de perfil de este usuario?"
          confirmLabel="Eliminar"
          danger
          onConfirm={handleDeletePicture}
          onClose={() => setShowDeletePicture(false)}
        />
      )}

      {showNewPunishment && (
        <NewPunishmentModal
          userId={user.id}
          onClose={() => setShowNewPunishment(false)}
          onCreated={() => {
            setShowNewPunishment(false)
            setPunPage(0)
            setPunFetchKey((k) => k + 1)
          }}
        />
      )}
    </>
  )
}
