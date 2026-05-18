import { useState, useEffect } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import AuthModal from '@/components/auth/AuthModal'
import useAuthStore from '@/store/authStore'
import useProfileModalStore from '@/store/profileModalStore'
import { deleteCurrentUser } from '@/services/userService'

export default function DeleteAccountModal() {
  const user = useAuthStore(s => s.user)
  const setUser = useAuthStore(s => s.setUser)
  const { activeModal, close } = useProfileModalStore()
  const isOpen = activeModal === 'delete'

  const [step, setStep] = useState<'confirm' | 'email'>('confirm')
  const [emailInput, setEmailInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setStep('confirm')
      setEmailInput('')
    }
  }, [isOpen])

  if (!user) return null

  const emailMatch = emailInput.trim().toLowerCase() === user.email.trim().toLowerCase()

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteCurrentUser()
      setUser(null)
      close()
      toast.success('Se eliminó tu cuenta.')
      window.location.href = '/'
    } catch {
      toast.error('No pudimos eliminar tu cuenta. Intentá de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AuthModal isOpen={isOpen} onClose={close} ariaLabel="Eliminar cuenta" size="md-lg">
      <div className="delete-modal-header">
        <AlertTriangle size={22} className="delete-modal-icon" />
        <h2 className="delete-modal-title">Eliminar Cuenta</h2>
      </div>

      {step === 'confirm' ? (
        <>
          <p className="delete-modal-message">
            Estás a punto de eliminar tu cuenta, esta acción es irreversible.
            ¿Seguro que deseás continuar?
          </p>
          <div className="delete-modal-footer">
            <button type="button" className="btn btn-ghost" onClick={close}>
              Cancelar
            </button>
            <button type="button" className="btn btn-danger" onClick={() => setStep('email')}>
              Continuar
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="delete-modal-message">
            Para confirmar el proceso, ingresá el correo electrónico de tu cuenta.
          </p>
          <input
            className="auth-field-input"
            type="email"
            placeholder={user.email}
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            autoComplete="email"
            style={{ width: '100%', marginBottom: '20px' }}
          />
          <div className="delete-modal-footer">
            <button type="button" className="btn btn-ghost" onClick={close}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={!emailMatch || isDeleting}
              onClick={handleDelete}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {isDeleting && <Loader2 size={14} className="spin" />}
              Eliminar Definitivamente
            </button>
          </div>
        </>
      )}
    </AuthModal>
  )
}
