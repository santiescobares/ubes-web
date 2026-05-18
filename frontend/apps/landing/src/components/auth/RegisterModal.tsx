import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import AuthModal from '@/components/auth/AuthModal'
import AuthInput from '@/components/auth/AuthInput'
import SchoolSelect from '@/components/auth/SchoolSelect'
import useAuthModalStore from '@/store/authModalStore'
import { registerUser } from '@/services/userService'
import type { School } from '@ubes/types'

export default function RegisterModal() {
  const { activeModal, registrationToken, registrationPayload, openLogin, close } = useAuthModalStore()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [school, setSchool] = useState<School | null>(null)
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; school?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const stripAccents = (str: string) =>
    str.normalize('NFD').replace(/[̀-ͯ]/g, '')

  useEffect(() => {
    if (activeModal === 'register' && registrationPayload) {
      setFirstName(stripAccents(registrationPayload.firstName))
      setLastName(stripAccents(registrationPayload.lastName))
      setSchool(null)
      setErrors({})
    }
  }, [activeModal, registrationPayload])

  if (activeModal !== 'register' || !registrationPayload || !registrationToken) return null

  const validate = () => {
    const next: typeof errors = {}
    if (firstName.trim().length < 3 || firstName.trim().length > 30)
      next.firstName = 'El nombre debe tener entre 3 y 30 caracteres.'
    if (lastName.trim().length < 3 || lastName.trim().length > 30)
      next.lastName = 'El apellido debe tener entre 3 y 30 caracteres.'
    if (!school)
      next.school = 'Seleccioná tu escuela.'
    return next
  }

  const handleSubmit = async () => {
    const next = validate()
    if (Object.keys(next).length > 0) { setErrors(next); return }
    setErrors({})
    setIsSubmitting(true)
    try {
      await registerUser({ firstName: firstName.trim(), lastName: lastName.trim(), school: school!, registrationToken })
      toast.success('Se creó tu cuenta. ¡Ya podés ingresar!')
      close()
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 401 || status === 403) {
        toast.error('Tu sesión expiró. Volvé a iniciar sesión.')
        openLogin()
      } else {
        toast.error('No pudimos crear tu cuenta. Intentá de nuevo.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthModal isOpen onClose={close} ariaLabel="Completar registro">
      <div className="auth-register">
        <h2 className="auth-register-title">Antes, algunos datos tuyos...</h2>

        <div className="auth-register-fields">
          <AuthInput
            id="reg-firstName"
            label="Nombre"
            value={firstName}
            onChange={v => { setFirstName(v); setErrors(e => ({ ...e, firstName: undefined })) }}
            error={errors.firstName}
            required
            maxLength={30}
            autoComplete="given-name"
          />
          <AuthInput
            id="reg-lastName"
            label="Apellido"
            value={lastName}
            onChange={v => { setLastName(v); setErrors(e => ({ ...e, lastName: undefined })) }}
            error={errors.lastName}
            required
            maxLength={30}
            autoComplete="family-name"
          />
          <SchoolSelect
            label="Escuela"
            value={school}
            onChange={v => { setSchool(v); setErrors(e => ({ ...e, school: undefined })) }}
            error={errors.school}
            required
          />
        </div>

        <div className="auth-register-warning">
          <AlertTriangle size={16} className="auth-register-warning-icon" />
          <p>
            No podrás cambiar tu escuela manualmente. Seleccionar una escuela que no te corresponde puede resultar en una sanción.
          </p>
        </div>

        <button
          type="button"
          className="btn auth-register-submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registrando...' : 'Registrarme'}
        </button>
      </div>
    </AuthModal>
  )
}
