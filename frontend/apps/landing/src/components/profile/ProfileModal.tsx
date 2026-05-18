import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import AuthModal from '@/components/auth/AuthModal'
import AuthInput from '@/components/auth/AuthInput'
import ProfilePictureBox from './ProfilePictureBox'
import useAuthStore from '@/store/authStore'
import useProfileModalStore from '@/store/profileModalStore'
import { updateCurrentUser } from '@/services/userService'
import { SCHOOL_OPTIONS } from '@/constants/schools'

function validate(firstName: string, lastName: string) {
  const errors: { firstName?: string; lastName?: string } = {}
  if (firstName.trim().length < 3 || firstName.trim().length > 30)
    errors.firstName = 'El nombre debe tener entre 3 y 30 caracteres'
  if (lastName.trim().length < 3 || lastName.trim().length > 30)
    errors.lastName = 'El apellido debe tener entre 3 y 30 caracteres'
  return errors
}

export default function ProfileModal() {
  const user = useAuthStore(s => s.user)
  const updateUser = useAuthStore(s => s.updateUser)
  const { activeModal, close, openDelete } = useProfileModalStore()
  const isOpen = activeModal === 'profile'

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setErrors({})
    }
  }, [isOpen, user])

  if (!user) return null

  const schoolLabel = SCHOOL_OPTIONS.find(s => s.value === user.school)?.label ?? user.school
  const hasChanges = firstName !== user.firstName || lastName !== user.lastName
  const hasErrors = !!(errors.firstName || errors.lastName)
  const saveDisabled = !hasChanges || hasErrors || isSaving || isUploading

  function handleFirstNameBlur() {
    const e = validate(firstName, lastName)
    setErrors(prev => ({ ...prev, firstName: e.firstName }))
  }

  function handleLastNameBlur() {
    const e = validate(firstName, lastName)
    setErrors(prev => ({ ...prev, lastName: e.lastName }))
  }

  async function handleSave() {
    const e = validate(firstName, lastName)
    if (e.firstName || e.lastName) { setErrors(e); return }

    const dto: Record<string, string> = {}
    if (firstName !== user!.firstName) dto.firstName = firstName.trim()
    if (lastName !== user!.lastName) dto.lastName = lastName.trim()

    setIsSaving(true)
    try {
      await updateCurrentUser(dto)
      updateUser({ firstName: firstName.trim(), lastName: lastName.trim() })
      toast.success('Perfil actualizado')
      close()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'No pudimos guardar los cambios. Intentá de nuevo')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AuthModal isOpen={isOpen} onClose={close} ariaLabel="Tu perfil" size="lg">
      <div className="profile-modal-header">
        <h2 className="profile-modal-title">Tu Perfil <span className="profile-modal-subtitle">• {user.email}</span></h2>
      </div>

      <div className="profile-modal-body">
        <div className="profile-modal-fields">
          <AuthInput
            id="profile-firstName"
            label="Nombre"
            value={firstName}
            onChange={setFirstName}
            error={errors.firstName}
            onBlur={handleFirstNameBlur}
            maxLength={30}
          />
          <AuthInput
            id="profile-lastName"
            label="Apellido"
            value={lastName}
            onChange={setLastName}
            error={errors.lastName}
            onBlur={handleLastNameBlur}
            maxLength={30}
          />
          <AuthInput
            id="profile-school"
            label="Escuela"
            value={schoolLabel}
            onChange={() => {}}
            disabled
          />
        </div>

        <ProfilePictureBox user={user} onUploadingChange={setIsUploading} />
      </div>

      <div className="profile-modal-footer">
        <button
          type="button"
          className="btn btn-danger"
          onClick={openDelete}
        >
          Eliminar Cuenta
        </button>
        <button
          type="button"
          className="btn"
          disabled={saveDisabled}
          onClick={handleSave}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          {(isSaving || isUploading) && <Loader2 size={14} className="spin" />}
          Guardar
        </button>
      </div>
    </AuthModal>
  )
}
